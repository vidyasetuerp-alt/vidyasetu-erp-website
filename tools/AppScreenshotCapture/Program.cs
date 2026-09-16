using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;
using static Native;

if (args.Length != 2)
{
    Console.Error.WriteLine("Usage: AppScreenshotCapture <application.exe> <output.png>");
    return 2;
}

string applicationPath = Path.GetFullPath(args[0]);
string outputPath = Path.GetFullPath(args[1]);
Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);

using Process process = Process.Start(new ProcessStartInfo
{
    FileName = applicationPath,
    WorkingDirectory = Path.GetDirectoryName(applicationPath)!,
    UseShellExecute = true
}) ?? throw new InvalidOperationException("The application could not be started.");

try
{
    IntPtr loginWindow = WaitForWindow(process.Id, text => text.Contains("Login", StringComparison.OrdinalIgnoreCase), TimeSpan.FromSeconds(45));
    Console.WriteLine($"Login window: {GetWindowText(loginWindow)}");

    IntPtr quickLogin = FindDescendant(loginWindow, text => text.Contains("Demo Login", StringComparison.OrdinalIgnoreCase));
    if (quickLogin == IntPtr.Zero)
    {
        quickLogin = FindDescendant(loginWindow, text => text.StartsWith("Demo:", StringComparison.OrdinalIgnoreCase) || text.StartsWith("Sr:", StringComparison.OrdinalIgnoreCase));
    }
    if (quickLogin == IntPtr.Zero)
    {
        throw new InvalidOperationException("The demo-login button was not found. The build may be activated instead of running in demo mode.");
    }

    SendMessage(quickLogin, Native.BM_CLICK, IntPtr.Zero, IntPtr.Zero);
    Thread.Sleep(500);

    List<IntPtr> editControls = FindDescendantsByClass(loginWindow, "EDIT");
    if (editControls.Count >= 2)
    {
        SendMessageText(editControls[0], Native.WM_SETTEXT, IntPtr.Zero, "demo123");
        SendMessageText(editControls[1], Native.WM_SETTEXT, IntPtr.Zero, "password");
    }

    IntPtr loginButton = FindDescendant(loginWindow, text => text.Equals("Login", StringComparison.OrdinalIgnoreCase) || text.Equals("Submit", StringComparison.OrdinalIgnoreCase));
    if (loginButton == IntPtr.Zero)
    {
        throw new InvalidOperationException("The Login button was not found.");
    }
    SendMessage(loginButton, Native.BM_CLICK, IntPtr.Zero, IntPtr.Zero);
    Thread.Sleep(1500);
    Console.WriteLine("After submit: " + string.Join(" | ", GetDescendantTexts(loginWindow).Where(text => !string.IsNullOrWhiteSpace(text)).Distinct()));

    IntPtr dashboardWindow = WaitForWindow(process.Id, text => text.Contains("Dashboard", StringComparison.OrdinalIgnoreCase), TimeSpan.FromSeconds(45));
    ShowWindow(dashboardWindow, Native.SW_MAXIMIZE);
    SetForegroundWindow(dashboardWindow);
    Thread.Sleep(3500);
    CaptureWindow(dashboardWindow, outputPath);
    Console.WriteLine($"Saved: {outputPath}");
}
finally
{
    if (!process.HasExited)
    {
        process.CloseMainWindow();
        if (!process.WaitForExit(3000))
        {
            process.Kill(entireProcessTree: true);
            process.WaitForExit(3000);
        }
    }
}

return 0;

static IntPtr WaitForWindow(int processId, Func<string, bool> predicate, TimeSpan timeout)
{
    Stopwatch timer = Stopwatch.StartNew();
    while (timer.Elapsed < timeout)
    {
        foreach (IntPtr handle in GetTopLevelWindows(processId))
        {
            string title = GetWindowText(handle);
            if (IsWindowVisible(handle) && predicate(title))
            {
                return handle;
            }
        }
        Thread.Sleep(250);
    }
    throw new TimeoutException($"Timed out waiting for an application window. Visible windows: {string.Join(" | ", GetTopLevelWindows(processId).Select(GetWindowText))}");
}

static List<IntPtr> GetTopLevelWindows(int processId)
{
    var result = new List<IntPtr>();
    EnumWindows((handle, _) =>
    {
        GetWindowThreadProcessId(handle, out uint ownerProcessId);
        if (ownerProcessId == processId)
        {
            result.Add(handle);
        }
        return true;
    }, IntPtr.Zero);
    return result;
}

static IntPtr FindDescendant(IntPtr parent, Func<string, bool> predicate)
{
    IntPtr found = IntPtr.Zero;
    EnumChildWindows(parent, (handle, _) =>
    {
        if (predicate(GetWindowText(handle)))
        {
            found = handle;
            return false;
        }
        return true;
    }, IntPtr.Zero);
    return found;
}

static List<string> GetDescendantTexts(IntPtr parent)
{
    var result = new List<string>();
    EnumChildWindows(parent, (handle, _) =>
    {
        result.Add(GetWindowText(handle));
        return true;
    }, IntPtr.Zero);
    return result;
}

static List<IntPtr> FindDescendantsByClass(IntPtr parent, string classFragment)
{
    var result = new List<IntPtr>();
    EnumChildWindows(parent, (handle, _) =>
    {
        var builder = new StringBuilder(256);
        _ = GetClassName(handle, builder, builder.Capacity);
        if (builder.ToString().Contains(classFragment, StringComparison.OrdinalIgnoreCase))
        {
            result.Add(handle);
        }
        return true;
    }, IntPtr.Zero);
    return result;
}

static string GetWindowText(IntPtr handle)
{
    int length = GetWindowTextLength(handle);
    var builder = new StringBuilder(length + 1);
    _ = Native.GetWindowText(handle, builder, builder.Capacity);
    return builder.ToString();
}

static void CaptureWindow(IntPtr handle, string outputPath)
{
    if (!GetWindowRect(handle, out RECT bounds))
    {
        throw new InvalidOperationException("Unable to read the dashboard window bounds.");
    }

    int width = bounds.Right - bounds.Left;
    int height = bounds.Bottom - bounds.Top;
    using var bitmap = new Bitmap(width, height, PixelFormat.Format32bppArgb);
    using Graphics graphics = Graphics.FromImage(bitmap);
    IntPtr hdc = graphics.GetHdc();
    try
    {
        bool printed = PrintWindow(handle, hdc, Native.PW_RENDERFULLCONTENT);
        if (!printed)
        {
            graphics.ReleaseHdc(hdc);
            hdc = IntPtr.Zero;
            graphics.CopyFromScreen(bounds.Left, bounds.Top, 0, 0, new Size(width, height), CopyPixelOperation.SourceCopy);
        }
    }
    finally
    {
        if (hdc != IntPtr.Zero)
        {
            graphics.ReleaseHdc(hdc);
        }
    }

    bitmap.Save(outputPath, ImageFormat.Png);
}

static class Native
{
    public const uint BM_CLICK = 0x00F5;
    public const uint WM_SETTEXT = 0x000C;
    public const int SW_MAXIMIZE = 3;
    public const uint PW_RENDERFULLCONTENT = 0x00000002;

    public delegate bool EnumWindowsProc(IntPtr handle, IntPtr parameter);

    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc callback, IntPtr parameter);

    [DllImport("user32.dll")]
    public static extern bool EnumChildWindows(IntPtr parent, EnumWindowsProc callback, IntPtr parameter);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr handle, out uint processId);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr handle, StringBuilder text, int maxCount);

    [DllImport("user32.dll")]
    public static extern int GetWindowTextLength(IntPtr handle);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr handle);

    [DllImport("user32.dll")]
    public static extern IntPtr SendMessage(IntPtr handle, uint message, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, EntryPoint = "SendMessageW")]
    public static extern IntPtr SendMessageText(IntPtr handle, uint message, IntPtr wParam, string text);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetClassName(IntPtr handle, StringBuilder className, int maxCount);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr handle, int command);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr handle);

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr handle, out RECT rect);

    [DllImport("user32.dll")]
    public static extern bool PrintWindow(IntPtr handle, IntPtr destination, uint flags);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
}

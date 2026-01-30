const styles = {
  info: "color: #3b82f6",
  error: "color: #ef4444",
  warning: "color: #f59e0b",
  success: "color: #22c55e",
};

function getCallerInfo(): string {
  const stack = new Error().stack?.split("\n");
  const callerLine = stack?.[3];
  if (!callerLine) return "";

  const match = callerLine.match(/at\s+(.*):(\d+):(\d+)/);
  if (!match) return "";

  const file = match[1]!.split("/").pop();
  return `[${file}:${match[2]}]`;
}

export function log(
  message: string,
  type: "info" | "error" | "warning" | "success" = "info",
) {
  const time = new Date().toLocaleTimeString();
  const location = getCallerInfo();

  console.log(
    `%c[${time}] [${type.toUpperCase()}] ${location}`,
    styles[type],
    message,
  );
}

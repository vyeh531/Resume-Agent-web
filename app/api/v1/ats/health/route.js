export async function GET() {
  return Response.json({
    success: true,
    server: 'ok',
    ruleEngine: 'ready',
    timestamp: new Date().toISOString(),
  });
}

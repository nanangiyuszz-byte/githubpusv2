export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base deep space */}
      <div className="absolute inset-0 bg-background" />
      {/* mesh gradient blobs */}
      <div
        className="absolute -top-40 -left-40 h-[55vw] w-[55vw] rounded-full opacity-50 blur-3xl animate-float-slow"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.25 305 / 0.6), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[50vw] w-[50vw] rounded-full opacity-50 blur-3xl animate-float-slow-2"
        style={{ background: "radial-gradient(circle, oklch(0.6 0.22 200 / 0.55), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 left-1/4 h-[45vw] w-[45vw] rounded-full opacity-40 blur-3xl animate-float-slow"
        style={{
          background: "radial-gradient(circle, oklch(0.45 0.2 270 / 0.6), transparent 70%)",
          animationDelay: "-6s",
        }}
      />
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, oklch(0.08 0.02 270 / 0.7) 100%)",
        }}
      />
    </div>
  );
}

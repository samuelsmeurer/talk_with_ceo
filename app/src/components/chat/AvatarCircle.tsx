export function AvatarCircle() {
  return (
    <div className="relative shrink-0">
      <div className="w-9 h-9 rounded-full border border-accent-primary/30 overflow-hidden">
        <img
          src="/assets/guille.jpeg"
          alt="Guille"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Online dot */}
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-online-green border-2 border-bg-primary" />
    </div>
  );
}

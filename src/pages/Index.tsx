// (Fragmento clave del layout de las tarjetas en Index.tsx)

<div className="flex flex-col gap-4">
  <h3 className="text-[11px] font-black text-[#57ea9d] uppercase tracking-[0.3em] ml-2">Analytics Center</h3>
  
  <StatCard 
    title="Puntos por Tiro (PPS)" 
    value={stats.monthly.pps} 
    subtitle={`Hoy: ${stats.today.pps} PPS`}
    sessions={sessions} 
    metric="pps" 
    zoneType="global"
    isHighlight 
    delay={0.1} 
  />

  <StatCard 
    title="eFG% (Eficiencia)" 
    value={stats.monthly.eFG} 
    subtitle={`Hoy: ${stats.today.eFG}%`}
    sessions={sessions} 
    metric="efg" 
    zoneType="global"
    delay={0.15} 
  />

  <div className="grid grid-cols-2 gap-4">
    <StatCard 
      title="% 3PT" 
      value={stats.monthly.threePct} 
      subtitle={`Hoy: ${stats.today.threePct}%`}
      sessions={sessions} 
      metric="pct" 
      zoneType="3p"
      delay={0.2} 
    />
    <StatCard 
      title="% 2PT" 
      value={stats.monthly.twoPct} 
      subtitle={`Hoy: ${stats.today.twoPct}%`}
      sessions={sessions} 
      metric="pct" 
      zoneType="2p"
      delay={0.25} 
    />
  </div>

  <StatCard 
    title="Tiros Libres (FT%)" 
    value={stats.monthly.ftPct} 
    subtitle={`Hoy: ${stats.today.ftPct}%`}
    sessions={sessions} 
    metric="pct" 
    zoneType="tl"
    delay={0.3} 
  />
</div>

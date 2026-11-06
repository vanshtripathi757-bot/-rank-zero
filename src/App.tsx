import { useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';


export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);
  const [entered, setEntered] = useState(false);
  const [xp, setXp] = useState(() => {
    try { return Math.max(0, Number(localStorage.getItem('rank-zero-xp')) || 0); }
    catch { return 0; }
  });
  const [objective, setObjective] = useState(() => {
    try { return localStorage.getItem('rank-zero-objective') || 'Meet a classmate in the courtyard'; }
    catch { return 'Meet a classmate in the courtyard'; }
  });
  const [missionComplete, setMissionComplete] = useState(() => xp > 0);
  const [missionNotice, setMissionNotice] = useState('CURRENT OBJECTIVE');
  const [activePanel, setActivePanel] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const panelContent: Record<string, { eyebrow: string; title: string; lines: string[] }> = {
    Character: { eyebrow: 'STUDENT RECORD', title: 'New Student', lines: ['Class: D — Foundation', 'Level: 01', 'Experience: ' + xp + ' XP', 'Status: Orientation in progress', 'Specialization: Undecided'] },
    Ranking: { eyebrow: 'ACADEMY RECORDS', title: 'Rankings are being prepared', lines: ['Class standings will appear after the first official evaluation.', 'NPC and player rankings will be shown separately.', 'Competitive scores will be server-verified.', 'No live multiplayer ranking is active in this prototype.'] },
    Missions: { eyebrow: 'CHAPTER 01 · FOUNDATION', title: 'First Day at the Academy', lines: [(xp >= 50 ? '✓ ' : '○ ') + 'Meet a classmate', (xp >= 100 ? '✓ ' : '○ ') + 'Find your teacher', (xp >= 200 ? '✓ ' : '○ ') + 'Enter the Class D homeroom', (xp >= 350 ? '✓ ' : '○ ') + 'Complete Class D orientation', (xp >= 400 ? '✓ ' : '○ ') + 'Explore the library', (xp >= 450 ? '✓ ' : '○ ') + 'Visit the cafeteria', (xp >= 500 ? '✓ ' : '○ ') + 'Explore the sports court', 'Current: ' + objective] },
    Inventory: { eyebrow: 'PERSONAL STORAGE', title: 'Inventory', lines: ['Your starter inventory is empty.', 'Earn items through story missions, clubs and academy events.', 'Cosmetic rewards will never provide pay-to-win advantages.'] },
    Friends: { eyebrow: 'SOCIAL', title: 'Academy contacts', lines: ['Classmate — Met in the courtyard', 'Teacher — Orientation guide', 'Online friends list is not connected yet.'] },
  };

  useEffect(() => {
    if (!entered || !host.current || game.current) return;
    let cancelled = false;
    let instance: Phaser.Game | null = null;
    let onMissionComplete: ((result: { xp: number; nextObjective: string }) => void) | null = null;

    // Load the game engine only after the player enters the academy. This keeps
    // the title screen light on mobile connections and defers Phaser's large bundle.
    void Promise.all([import('phaser'), import('./CampusScene')]).then(([PhaserModule, sceneModule]) => {
      if (cancelled || !host.current) return;
      const PhaserRuntime = PhaserModule.default;
      instance = new PhaserRuntime.Game({
        type: PhaserRuntime.AUTO, parent: host.current, backgroundColor: '#15182f',
        scale: { mode: PhaserRuntime.Scale.FIT, autoCenter: PhaserRuntime.Scale.CENTER_BOTH, width: 1280, height: 720 },
        scene: [new sceneModule.default(xp)],
      });
      game.current = instance;
      onMissionComplete = (result: { xp: number; nextObjective: string }) => {
        setXp(current => current + result.xp);
        setMissionComplete(true);
        setMissionNotice('MISSION COMPLETE · +' + result.xp + ' XP');
        setObjective(result.nextObjective);
      };
      instance.events.on('mission-complete', onMissionComplete);
    }).catch(error => {
      console.error('Unable to load the academy world:', error);
    });

    return () => {
      cancelled = true;
      if (instance) {
        if (onMissionComplete) instance.events.off('mission-complete', onMissionComplete);
        instance.destroy(true);
      }
      if (game.current === instance) game.current = null;
    };
  }, [entered]);

  useEffect(() => {
    try {
      localStorage.setItem('rank-zero-xp', String(xp));
      localStorage.setItem('rank-zero-objective', objective);
    } catch (error) {
      console.warn('Local progress could not be saved:', error);
    }
  }, [xp, objective]);

  return <main className="shell">
    {!entered ? <section className="title">
      <div className="brand">RANK:<b>ZERO</b><small>ACADEMY ONLINE RPG</small></div>
      <div className="copy">
        <p className="eyebrow">A NEW ACADEMY. A NEW HIERARCHY.</p>
        <h1>START AT THE<br/><em>BOTTOM.</em></h1>
        <h2>Rise Above Everyone.</h2>
        <p>Your story begins in Class D. Earn your place, build alliances, and prove yourself.</p>
        <button onClick={() => setEntered(true)}>ENTER ACADEMY <span>↗</span></button>
      </div>
      <div className="skyline" aria-hidden="true"><i/><i/><i/><div/></div>
      <footer><span>ONLINE WORLD</span><span>SEASON 01 · FOUNDATION</span><span>CLASS D</span></footer>
    </section> : <section className="world">
      <div className="stage" ref={host}/>
      <header className="hud">
        <div className="profile"><b>D</b><span>NEW STUDENT<small>LEVEL 01 · CLASS D · {xp} XP</small></span></div>
        <div className="zone">FOUNDATION CAMPUS</div>
        <button className="menu-toggle" onClick={() => setShowMenu(v => !v)}>☰</button>
      </header>
      <div className={`mission${missionComplete ? " completed" : ""}`}><small>{missionComplete ? missionNotice : "CURRENT OBJECTIVE"}</small><b>{objective}</b></div>
      {showMenu && <nav className="menu">{['Character','Ranking','Missions','Inventory','Friends'].map(x => <button key={x} onClick={() => { setActivePanel(x); setShowMenu(false); }}>{x}</button>)}<button onClick={() => setShowMenu(false)}>Close menu</button></nav>}
      {activePanel && <section className="game-panel" role="dialog" aria-label={activePanel}><button className="panel-close" onClick={() => setActivePanel('')}>×</button><small>{panelContent[activePanel].eyebrow}</small><h2>{panelContent[activePanel].title}</h2><ul>{panelContent[activePanel].lines.map((line, i) => <li key={i}>{line}</li>)}</ul></section>}
      <div className="xp-track"><span style={{ width: Math.min(100, (xp % 300) / 3) + '%' }} /></div>
      <div className="prototype">LOCAL GAME PREVIEW · ONLINE FEATURES IN DEVELOPMENT</div>
    </section>}
  </main>;
}

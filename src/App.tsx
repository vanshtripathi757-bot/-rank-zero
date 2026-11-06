import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

class CampusScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Container;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private target?: Phaser.Math.Vector2;
  private moveX = 0;
  private moveY = 0;
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickKnob?: Phaser.GameObjects.Arc;
  private dialogue?: Phaser.GameObjects.Text;
  private dialogueTimer?: Phaser.Time.TimerEvent;
  private npcX = 0;
  private npcY = 0;
  private firstMissionComplete = false;
  private teacherX = 0;
  private teacherY = 0;
  private teacherMissionComplete = false;
  private homeroomX = 0;
  private homeroomY = 0;
  private homeroomMissionComplete = false;
  private classroomX = 0;
  private classroomY = 0;
  private orientationStarted = false;
  private orientationComplete = false;

  constructor() { super('Campus'); }

  preload() {
    this.load.svg('campus-background', '/assets/campus-background.svg');
  }

  create() {
    const { width: w, height: h } = this.scale;
    if (this.textures.exists('campus-background')) {
      const bg = this.add.image(w / 2, h / 2, 'campus-background');
      bg.setDisplaySize(w, h).setDepth(-100);
    }
    const g = this.add.graphics();
    // This graphics layer is reserved for foreground world markers; keep it visible.

    // World backdrop is the generated academy artwork. Keep all gameplay actors
    // (homeroom marker, NPCs, player and controls) as independent game objects.

    // Class D homeroom entrance: a visible, interactable destination for onboarding.
    this.homeroomX = w * 0.5;
    this.homeroomY = h * 0.49;
    g.lineStyle(3, 0xc8a8ff, 0.95);
    g.strokeCircle(this.homeroomX, this.homeroomY, 23);
    g.fillStyle(0x8f69ff, 0.16);
    g.fillCircle(this.homeroomX, this.homeroomY, 17);
    g.lineStyle(1, 0xffffff, 0.5);
    g.strokeCircle(this.homeroomX, this.homeroomY, 29);
    this.add.text(this.homeroomX, this.homeroomY - 62, 'CLASS D · HOMEROOM', {
      fontFamily: 'Arial', fontSize: '10px', color: '#fff0d4',
      stroke: '#241a3b', strokeThickness: 3, shadow: { offsetX: 0, offsetY: 2, color: '#120d24', blur: 5, fill: true },
    }).setOrigin(0.5);

    // Class D orientation classroom: the next story destination after homeroom.
    this.classroomX = w * 0.5;
    this.classroomY = h * 0.29;
    g.lineStyle(2, 0x79d9ff, 0.95);
    g.strokeRoundedRect(this.classroomX - 34, this.classroomY - 24, 68, 48, 8);
    g.fillStyle(0x54b9e8, 0.18);
    g.fillRoundedRect(this.classroomX - 30, this.classroomY - 20, 60, 40, 6);
    this.add.text(this.classroomX, this.classroomY - 38, 'CLASS D · ORIENTATION', {
      fontFamily: 'Arial', fontSize: '10px', color: '#d9f5ff',
      stroke: '#14233c', strokeThickness: 3,
    }).setOrigin(0.5);

    // Keep one clear destination marker; avoid duplicated homeroom labels.

    // A classmate NPC for the first social interaction.
    this.npcX = w * 0.5;
    this.npcY = h * 0.61;
    const npc = this.add.container(this.npcX, this.npcY);
    const npcArt = this.add.graphics();
    npcArt.fillStyle(0x11101f, 0.4);
    npcArt.fillEllipse(0, 13, 28, 10);
    npcArt.fillStyle(0x344d72, 1);
    npcArt.fillRoundedRect(-10, -1, 20, 27, 5);
    npcArt.fillStyle(0xe8e4f1, 1);
    npcArt.fillTriangle(-7, 1, 0, 9, 7, 1);
    npcArt.fillStyle(0xf0c9b7, 1);
    npcArt.fillCircle(0, -12, 9);
    npcArt.fillStyle(0x49354a, 1);
    npcArt.fillEllipse(0, -19, 20, 10);
    npc.add(npcArt).setDepth(this.npcY);
    this.add.text(this.npcX, this.npcY - 43, 'CLASSMATE', {
      fontFamily: 'Arial', fontSize: '10px', color: '#ffffff',
      stroke: '#241a3b', strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 2, color: '#120d24', blur: 5, fill: true },
    }).setOrigin(0.5);

    // Teacher NPC near the homeroom direction marker.
    this.teacherX = w * 0.78;
    this.teacherY = h * 0.61;
    const teacher = this.add.container(this.teacherX, this.teacherY);
    const teacherArt = this.add.graphics();
    teacherArt.fillStyle(0x10101d, 0.38);
    teacherArt.fillEllipse(0, 14, 31, 11);
    teacherArt.fillStyle(0x292c43, 1);
    teacherArt.fillRoundedRect(-12, -2, 24, 31, 4);
    teacherArt.fillStyle(0xd8d8e5, 1);
    teacherArt.fillRect(-8, 2, 16, 5);
    teacherArt.fillStyle(0xe9c6b5, 1);
    teacherArt.fillCircle(0, -14, 10);
    teacherArt.fillStyle(0x353047, 1);
    teacherArt.fillEllipse(0, -22, 22, 9);
    teacher.add(teacherArt).setDepth(this.teacherY);
    this.add.text(this.teacherX, this.teacherY - 46, 'TEACHER', {
      fontFamily: 'Arial', fontSize: '10px', color: '#fff4dc',
      stroke: '#241a3b', strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 2, color: '#120d24', blur: 5, fill: true },
    }).setOrigin(0.5);

    // Player shadow and a simple layered academy-uniform character.
    const px = w * 0.5, py = h * 0.78;
    const shadow = this.add.ellipse(0, 15, 34, 13, 0x08101b, 0.48);
    const avatar = this.add.graphics();
    avatar.fillStyle(0x29223d, 1); avatar.fillRoundedRect(-12, -3, 24, 30, 7);
    avatar.fillStyle(0xeee9f7, 1); avatar.fillPoints([
      new Phaser.Geom.Point(-9, -1), new Phaser.Geom.Point(0, 9), new Phaser.Geom.Point(9, -1),
      new Phaser.Geom.Point(7, 22), new Phaser.Geom.Point(-7, 22),
    ], true);
    avatar.fillStyle(0x5d4b91, 1); avatar.fillRect(-3, 1, 6, 20);
    avatar.fillStyle(0x1c1a2e, 1); avatar.fillRoundedRect(-10, 23, 8, 10, 3); avatar.fillRoundedRect(2, 23, 8, 10, 3);
    avatar.fillStyle(0xf2cdbd, 1); avatar.fillCircle(0, -13, 10);
    avatar.fillStyle(0x292039, 1); avatar.fillEllipse(0, -20, 21, 12);
    avatar.fillTriangle(-10, -18, -5, -28, 1, -20);
    avatar.fillStyle(0x3a2b4d, 1); avatar.fillRect(-2, -14, 2, 2); avatar.fillRect(4, -14, 2, 2);
    const character = this.add.container(px, py, [shadow, avatar]).setDepth(py);
    this.player = character;

    // Mobile virtual joystick and TALK button.
    this.joystickBase = this.add.circle(82, h - 88, 46, 0x0b1024, 0.55)
      .setStrokeStyle(2, 0xb8a3ff, 0.7).setDepth(1000).setVisible(false);
    this.joystickKnob = this.add.circle(82, h - 88, 20, 0x9a7bff, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.8).setDepth(1001).setVisible(false);
    this.add.circle(w - 70, h - 88, 36, 0x7554d9, 0.9)
      .setStrokeStyle(2, 0xe4d9ff, 0.9).setDepth(1000);
    this.add.text(w - 70, h - 88, 'TALK', {
      fontFamily: 'Arial', fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1001);
    this.dialogue = this.add.text(w / 2, h - 155, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffffff',
      backgroundColor: '#111426ee', padding: { x: 12, y: 9 },
      align: 'center', wordWrap: { width: w - 48 },
    }).setOrigin(0.5).setDepth(1100);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.x < 150 && p.y > h - 165) {
        this.target = undefined;
        this.joystickBase?.setVisible(true).setPosition(82, h - 88);
        this.joystickKnob?.setVisible(true).setPosition(82, h - 88);
        this.updateJoystick(p.x, p.y);
      } else if (p.x > w - 135 && p.y > h - 155) {
        this.interact();
      } else if (p.y > 72 && p.y < h - 175) {
        this.target = new Phaser.Math.Vector2(p.x, p.y);
      }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.joystickBase?.visible && p.isDown) this.updateJoystick(p.x, p.y);
    });
    this.input.on('pointerup', () => {
      this.moveX = 0;
      this.moveY = 0;
      this.joystickBase?.setVisible(false);
      this.joystickKnob?.setVisible(false);
    });
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    }
    // Phaser.Scale.FIT resizes the canvas without restarting the scene, so mission state is preserved.
  }

  private updateJoystick(x: number, y: number) {
    const cx = 82;
    const cy = this.scale.height - 88;
    const dx = x - cx;
    const dy = y - cy;
    const length = Math.hypot(dx, dy) || 1;
    const amount = Math.min(32, length);
    this.moveX = dx / length * Math.min(1, length / 32);
    this.moveY = dy / length * Math.min(1, length / 32);
    this.joystickKnob?.setPosition(cx + dx / length * amount, cy + dy / length * amount);
  }

  private interact() {
    if (!this.player || !this.dialogue) return;
    const classmateDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npcX, this.npcY);
    const teacherDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.teacherX, this.teacherY);
    const homeroomDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.homeroomX, this.homeroomY);
    const classroomDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.classroomX, this.classroomY);
    if (!this.firstMissionComplete && classmateDistance < 125) {
      this.dialogue.setText('Classmate: Welcome! The teacher near the east path can guide you to Class D.');
      this.firstMissionComplete = true;
      this.game.events.emit('mission-complete', { xp: 50, nextObjective: 'Find the teacher near the east path' });
    } else if (this.firstMissionComplete && !this.teacherMissionComplete && teacherDistance < 125) {
      this.dialogue.setText('Teacher: Welcome to Class D. Your homeroom is the marked entrance near the central hall.');
      this.teacherMissionComplete = true;
      this.game.events.emit('mission-complete', { xp: 50, nextObjective: 'Enter the Class D homeroom' });
    } else if (this.teacherMissionComplete && !this.homeroomMissionComplete && homeroomDistance < 105) {
      this.dialogue.setText('You entered Class D. Your first lesson is about to begin. Welcome to the academy.');
      this.homeroomMissionComplete = true;
      this.game.events.emit('mission-complete', { xp: 100, nextObjective: 'Go to the Class D orientation room' });
    } else if (this.homeroomMissionComplete && !this.orientationStarted && classroomDistance < 110) {
      this.dialogue.setText('Instructor: Welcome to orientation. Learn the academy rules, class system, and campus code. Your first day starts now.');
      this.orientationStarted = true;
      this.game.events.emit('mission-complete', { xp: 50, nextObjective: 'Speak to the instructor again to complete orientation' });
    } else if (this.orientationStarted && !this.orientationComplete && classroomDistance < 110) {
      this.dialogue.setText('Orientation complete. You are officially registered as a Class D student. Your campus access is now active.');
      this.orientationComplete = true;
      this.game.events.emit('mission-complete', { xp: 100, nextObjective: 'Explore the Foundation Campus' });
    } else if (classmateDistance >= 125 && teacherDistance >= 125 && homeroomDistance >= 105 && classroomDistance >= 110) {
      this.dialogue.setText('Move closer to a nearby character or the Class D entrance to interact.');
    } else if (!this.firstMissionComplete) {
      this.dialogue.setText('Classmate: Come closer and say hello.');
    } else if (!this.teacherMissionComplete) {
      this.dialogue.setText('Teacher: I will be waiting near the east path.');
    } else if (!this.homeroomMissionComplete) {
      this.dialogue.setText('Class D: Move to the marked homeroom entrance and press TALK.');
    } else if (!this.orientationStarted) {
      this.dialogue.setText('Class D: Head to the blue orientation marker near the upper courtyard.');
    } else if (!this.orientationComplete) {
      this.dialogue.setText('Instructor: Press TALK again here when you are ready to finish orientation.');
    } else {
      this.dialogue.setText('Chapter 1 complete. Your academy journey begins here.');
    }
    this.dialogueTimer?.remove(false);
    this.dialogueTimer = this.time.delayedCall(3800, () => this.dialogue?.setText(''));
  }

  update(_time: number, delta: number) {
    if (!this.player) return;
    let dx = this.moveX, dy = this.moveY;
    if (this.cursors?.left.isDown || this.keys?.A.isDown) dx = -1;
    if (this.cursors?.right.isDown || this.keys?.D.isDown) dx = 1;
    if (this.cursors?.up.isDown || this.keys?.W.isDown) dy = -1;
    if (this.cursors?.down.isDown || this.keys?.S.isDown) dy = 1;
    const speed = delta * 0.19;
    if (dx || dy) {
      this.target = undefined;
      const len = Math.hypot(dx, dy);
      this.player.x += dx / len * speed; this.player.y += dy / len * speed;
    } else if (this.target) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
      if (d < 4) this.target = undefined;
      else {
        const a = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.target.x, this.target.y);
        this.player.x += Math.cos(a) * speed; this.player.y += Math.sin(a) * speed;
      }
    }
    this.player.x = Phaser.Math.Clamp(this.player.x, 22, this.scale.width - 22);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.scale.height * 0.19, this.scale.height - 42);
    this.player.setDepth(this.player.y);
  }
}

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);
  const [entered, setEntered] = useState(false);
  const [menu, setMenu] = useState(false);
  const [objective, setObjective] = useState('Meet a classmate in the courtyard');
  const [xp, setXp] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [missionNotice, setMissionNotice] = useState('CURRENT OBJECTIVE');
  const [activePanel, setActivePanel] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const panelContent: Record<string, { eyebrow: string; title: string; lines: string[] }> = {
    Character: { eyebrow: 'STUDENT RECORD', title: 'New Student', lines: ['Class: D — Foundation', 'Level: 01', 'Experience: ' + xp + ' XP', 'Status: Orientation in progress', 'Specialization: Undecided'] },
    Ranking: { eyebrow: 'ACADEMY RECORDS', title: 'Rankings are being prepared', lines: ['Class standings will appear after the first official evaluation.', 'NPC and player rankings will be shown separately.', 'Competitive scores will be server-verified.', 'No live multiplayer ranking is active in this prototype.'] },
    Missions: { eyebrow: 'CHAPTER 01 · FOUNDATION', title: 'First Day at the Academy', lines: ['✓ Meet a classmate', '✓ Find your teacher', '✓ Enter the Class D homeroom', '✓ Complete Class D orientation', 'Current: ' + objective] },
    Inventory: { eyebrow: 'PERSONAL STORAGE', title: 'Inventory', lines: ['Your starter inventory is empty.', 'Earn items through story missions, clubs and academy events.', 'Cosmetic rewards will never provide pay-to-win advantages.'] },
    Friends: { eyebrow: 'SOCIAL', title: 'Academy contacts', lines: ['Classmate — Met in the courtyard', 'Teacher — Orientation guide', 'Online friends list is not connected yet.'] },
  };

  useEffect(() => {
    if (!entered || !host.current || game.current) return;
    game.current = new Phaser.Game({
      type: Phaser.AUTO, parent: host.current, backgroundColor: '#15182f',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1280, height: 720 },
      scene: [CampusScene],
    });
    const onMissionComplete = (result: { xp: number; nextObjective: string }) => {
      setXp(current => current + result.xp);
      setMissionComplete(true);
      setMissionNotice('MISSION COMPLETE · +' + result.xp + ' XP');
      setObjective(result.nextObjective);
    };
    game.current.events.on('mission-complete', onMissionComplete);
    return () => {
      game.current?.events.off('mission-complete', onMissionComplete);
      game.current?.destroy(true);
      game.current = null;
    };
  }, [entered]);

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

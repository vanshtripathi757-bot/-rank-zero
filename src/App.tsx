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
  private npcX = 0;
  private npcY = 0;
  private firstMissionComplete = false;

  constructor() { super('Campus'); }

  private polygon(g: Phaser.GameObjects.Graphics, points: Array<[number, number]>, color: number, alpha = 1) {
    g.fillStyle(color, alpha);
    g.fillPoints(points.map(([x, y]) => new Phaser.Geom.Point(x, y)), true);
  }

  create() {
    const { width: w, height: h } = this.scale;
    const g = this.add.graphics();

    // Atmospheric sky and distant academy district.
    g.fillGradientStyle(0x11152b, 0x11152b, 0x25223e, 0x182b37, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0xa58aff, 0.09);
    g.fillCircle(w * 0.77, h * 0.22, Math.min(w, h) * 0.2);

    // Distant skyline with varied rooflines and lit windows.
    for (let i = 0; i < 23; i++) {
      const bw = w * (0.035 + (i % 3) * 0.008);
      const x = i * w / 21 - bw * 0.35;
      const bh = h * (0.12 + ((i * 17) % 19) / 100);
      const y = h * 0.43 - bh;
      g.fillStyle(i % 2 ? 0x252943 : 0x30304d, 0.95);
      g.fillRect(x, y, bw, bh);
      g.fillStyle(0xb6a2ff, 0.5);
      for (let wy = y + 12; wy < h * 0.42; wy += 19) {
        for (let wx = x + 7; wx < x + bw - 4; wx += 14) {
          if ((Math.floor(wx + wy) % 3) !== 0) g.fillRect(wx, wy, 4, 6);
        }
      }
    }

    // Academy silhouette: central hall, wings, roof, columns and lit windows.
    const buildingY = h * 0.20;
    g.fillStyle(0x111628, 0.45);
    g.fillEllipse(w * 0.5, h * 0.47, w * 0.76, h * 0.10);
    g.fillStyle(0x35334f, 1);
    g.fillRect(w * 0.13, buildingY + h * 0.13, w * 0.74, h * 0.23);
    g.fillStyle(0x42405f, 1);
    g.fillRect(w * 0.28, buildingY, w * 0.44, h * 0.34);
    this.polygon(g, [[w*.24,buildingY+8],[w*.5,buildingY-h*.105],[w*.76,buildingY+8]], 0x777095);
    this.polygon(g, [[w*.28,buildingY+8],[w*.5,buildingY-h*.075],[w*.72,buildingY+8]], 0x9284b2, 0.55);

    // Roof trim and central crest.
    g.fillStyle(0xc6b2ff, 0.7);
    g.fillRect(w * 0.29, buildingY + 5, w * 0.42, 4);
    g.fillStyle(0x17192e, 1);
    g.fillRoundedRect(w * 0.455, buildingY + h * 0.20, w * 0.09, h * 0.14, 4);
    g.fillStyle(0xbca8ff, 0.85);
    g.fillCircle(w * 0.5, buildingY + h * 0.09, Math.max(5, w * 0.018));
    g.lineStyle(2, 0xd0c3ff, 0.55);
    g.strokeCircle(w * 0.5, buildingY + h * 0.09, Math.max(9, w * 0.028));

    // Window bays, frames and warm interior glow.
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 7; col++) {
        const x = w * (0.315 + col * 0.053);
        const y = buildingY + h * (0.105 + row * 0.105);
        g.fillStyle(0x171b32, 1);
        g.fillRoundedRect(x - 2, y - 2, w * 0.032, h * 0.065, 2);
        g.fillStyle((row + col) % 4 === 0 ? 0xffd9a0 : 0xbba7ff, 0.9);
        g.fillRect(x, y, w * 0.027, h * 0.057);
        g.lineStyle(1, 0xf0dcff, 0.5);
        g.lineBetween(x + w * 0.0135, y, x + w * 0.0135, y + h * 0.057);
      }
    }
    // Side wings and pillars.
    for (let i = 0; i < 5; i++) {
      const x = w * (0.16 + i * 0.145);
      g.fillStyle(0x777095, 0.75);
      g.fillRect(x, buildingY + h * 0.17, w * 0.012, h * 0.18);
      g.fillStyle(0x24243d, 0.8);
      g.fillRect(x + w * 0.022, buildingY + h * 0.21, w * 0.04, h * 0.10);
    }

    // Campus lawn and tiled courtyard.
    g.fillGradientStyle(0x19363a, 0x19363a, 0x142a32, 0x142a32, 1);
    g.fillRect(0, h * 0.43, w, h * 0.57);
    this.polygon(g, [[w*.5,h*.42],[w*.91,h*.79],[w*.5,h*1.08],[w*.09,h*.79]], 0x34434d);
    this.polygon(g, [[w*.5,h*.47],[w*.84,h*.78],[w*.5,h*1.02],[w*.16,h*.78]], 0x3b4b54, 0.75);

    // Subtle paving seams follow the isometric courtyard.
    g.lineStyle(1, 0xb8c2c8, 0.12);
    for (let i = -5; i <= 5; i++) {
      g.lineBetween(w * (0.5 + i * 0.065), h * 0.48, w * (0.5 + i * 0.12), h * 0.96);
      g.lineBetween(w * 0.5 - Math.abs(i) * w * 0.035, h * (0.68 + i * 0.025), w * 0.5 + Math.abs(i) * w * 0.035, h * (0.68 + i * 0.025));
    }

    // Garden beds, shrubs and decorative trees.
    const treeRows = [h * 0.59, h * 0.75];
    treeRows.forEach((y, row) => {
      const count = row === treeRows[0] ? 5 : 4;
      for (let i = 0; i < count; i++) {
        const x = w * (row === treeRows[0] ? 0.09 + i * 0.205 : 0.18 + i * 0.215);
        g.fillStyle(0x101f2a, 0.35);
        g.fillEllipse(x + 5, y + 15, 34, 12);
        g.fillStyle(0x59465f, 1);
        g.fillRect(x - 4, y - 1, 8, 27);
        g.fillStyle(0x285d55, 1);
        g.fillCircle(x, y - 14, 20);
        g.fillStyle(0x438274, 1);
        g.fillCircle(x - 6, y - 20, 13);
        g.fillStyle(0x9ac4a4, 0.35);
        g.fillCircle(x - 10, y - 25, 5);
      }
    });

    // Path lanterns and benches.
    for (let i = 0; i < 4; i++) {
      const x = w * (0.12 + i * 0.25);
      const y = h * 0.53;
      g.fillStyle(0x333044, 1); g.fillRect(x - 2, y, 4, 35);
      g.fillStyle(0xffdba0, 0.9); g.fillCircle(x, y - 4, 5);
      g.fillStyle(0xffdba0, 0.12); g.fillCircle(x, y - 4, 15);
    }
    for (const x of [w * 0.25, w * 0.75]) {
      g.fillStyle(0x55445c, 1); g.fillRoundedRect(x - 22, h * 0.83, 44, 7, 2);
      g.fillRect(x - 17, h * 0.83 + 7, 4, 12); g.fillRect(x + 13, h * 0.83 + 7, 4, 12);
    }

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
    this.add.text(this.npcX, this.npcY - 40, 'CLASSMATE', {
      fontFamily: 'Arial', fontSize: '10px', color: '#f1eaff',
      backgroundColor: '#17152dcc', padding: { x: 6, y: 4 },
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
    this.scale.on('resize', () => this.scene.restart());
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
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npcX, this.npcY);
    if (distance >= 125) {
      this.dialogue.setText('Move closer to the classmate to talk.');
      this.time.delayedCall(2500, () => this.dialogue?.setText(''));
      return;
    }
    this.dialogue.setText('Classmate: Welcome to Foundation Campus, new student!');
    if (!this.firstMissionComplete) {
      this.firstMissionComplete = true;
      this.game.events.emit('mission-complete', { xp: 50, nextObjective: 'Find your Class D homeroom' });
    }
    this.time.delayedCall(3500, () => this.dialogue?.setText(''));
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
    this.player.y = Phaser.Math.Clamp(this.player.y, this.scale.height * 0.47, this.scale.height - 42);
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

  useEffect(() => {
    if (!entered || !host.current || game.current) return;
    game.current = new Phaser.Game({
      type: Phaser.AUTO, parent: host.current, backgroundColor: '#15182f',
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1280, height: 720 },
      scene: [CampusScene],
    });
    const onMissionComplete = (result: { xp: number; nextObjective: string }) => {
      setXp(current => current + result.xp);
      setMissionComplete(true);
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
        <button className="menu-toggle" onClick={() => setMenu(v => !v)}>☰</button>
      </header>
      <div className={`mission${missionComplete ? " completed" : ""}`}><small>{missionComplete ? "MISSION COMPLETE · +50 XP" : "CURRENT OBJECTIVE"}</small><b>{objective}</b></div>
      {menu && <nav className="menu">{['Character','Ranking','Missions','Inventory','Friends','Close menu'].map(x => <button key={x} onClick={() => setMenu(false)}>{x}</button>)}</nav>}
      <div className="prototype">LOCAL GAME PREVIEW · ONLINE FEATURES IN DEVELOPMENT</div>
    </section>}
  </main>;
}

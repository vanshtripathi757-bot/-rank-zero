import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

class CampusScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Arc;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private target?: Phaser.Math.Vector2;

  constructor() { super('Campus'); }

  create() {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    g.fillGradientStyle(0x15182f, 0x15182f, 0x29344b, 0x29344b, 1);
    g.fillRect(0, 0, width, height);
    for (let i = 0; i < 18; i++) {
      const x = i * width / 18;
      const h = 70 + (i * 37 % 120);
      g.fillStyle(i % 2 ? 0x292b4b : 0x343452, 1);
      g.fillRect(x, height * .43 - h, width / 25, h);
      g.fillStyle(0xb7a0ff, .5);
      for (let y = height * .43 - h + 12; y < height * .43 - 8; y += 22) g.fillRect(x + 8, y, 4, 6);
    }
    g.fillStyle(0x1a3038, 1);
    g.fillRect(0, height * .44, width, height * .56);
    g.fillStyle(0x34434c, 1);
    g.fillPoints([
      new Phaser.Geom.Point(width * .5, height * .42),
      new Phaser.Geom.Point(width * .86, height * .78),
      new Phaser.Geom.Point(width * .5, height),
      new Phaser.Geom.Point(width * .14, height * .78),
    ], true);
    g.fillStyle(0x34334f, 1);
    g.fillRect(width * .34, height * .19, width * .32, height * .25);
    g.fillStyle(0x69608d, 1);
    g.fillTriangle(width * .3, height * .2, width * .5, height * .07, width * .7, height * .2);
    g.fillStyle(0x17182c, 1);
    g.fillRect(width * .46, height * .31, width * .08, height * .13);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xc1aaff, .8);
      g.fillRect(width * (.365 + i * .055), height * .25, 12, 25);
    }
    for (let i = 0; i < 9; i++) {
      const x = width * (.08 + i * .105);
      const y = height * (.58 + (i % 2) * .15);
      g.fillStyle(0x4d3b55, 1); g.fillRect(x - 3, y, 6, 25);
      g.fillStyle(0x4c806e, 1); g.fillCircle(x, y - 7, 17);
    }
    this.add.text(width / 2, 22, 'FOUNDATION CAMPUS', {
      fontFamily: 'Arial', fontSize: '15px', color: '#eee8ff', fontStyle: 'bold',
    }).setOrigin(.5);
    this.player = this.add.circle(width * .5, height * .76, 12, 0x8965ff).setStrokeStyle(3, 0xffffff);
    this.add.circle(width * .5, height * .76 - 17, 7, 0xffd9c8);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.y > 65) this.target = new Phaser.Math.Vector2(p.x, p.y);
    });
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    }
    this.scale.on('resize', () => this.scene.restart());
  }

  update(_time: number, delta: number) {
    if (!this.player) return;
    let dx = 0, dy = 0;
    if (this.cursors?.left.isDown || this.keys?.A.isDown) dx--;
    if (this.cursors?.right.isDown || this.keys?.D.isDown) dx++;
    if (this.cursors?.up.isDown || this.keys?.W.isDown) dy--;
    if (this.cursors?.down.isDown || this.keys?.S.isDown) dy++;
    const speed = delta * .22;
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
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, this.scale.width - 16);
    this.player.y = Phaser.Math.Clamp(this.player.y, 90, this.scale.height - 16);
  }
}

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);
  const [entered, setEntered] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!entered || !host.current || game.current) return;
    game.current = new Phaser.Game({
      type: Phaser.AUTO, parent: host.current, backgroundColor: '#15182f',
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
      scene: [CampusScene],
    });
    return () => { game.current?.destroy(true); game.current = null; };
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
        <div className="profile"><b>D</b><span>NEW STUDENT<small>LEVEL 01 · CLASS D</small></span></div>
        <div className="zone">● FOUNDATION CAMPUS</div>
        <button className="menu-toggle" onClick={() => setMenu(v => !v)}>☰</button>
      </header>
      <div className="mission"><small>CURRENT OBJECTIVE</small><b>Explore the academy courtyard</b></div>
      {menu && <nav className="menu">{['Character','Ranking','Missions','Inventory','Friends','Close menu'].map(x => <button key={x} onClick={() => setMenu(false)}>{x}</button>)}</nav>}
      <div className="prototype">PROTOTYPE BUILD · MULTIPLAYER NOT CONNECTED</div>
    </section>}
  </main>;
}

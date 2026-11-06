import Phaser from 'phaser';

export default class CampusScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Container;
  private playerLegs?: Phaser.GameObjects.Graphics;
  private playerArms?: Phaser.GameObjects.Graphics;
  private walkClock = 0;
  private facing = 1;
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
  private libraryX = 0;
  private libraryY = 0;
  private libraryComplete = false;
  private cafeteriaX = 0;
  private cafeteriaY = 0;
  private cafeteriaComplete = false;
  private sportsX = 0;
  private sportsY = 0;
  private sportsComplete = false;
  private interiorMode: string | null = null;
  private interiorObjects: Phaser.GameObjects.GameObject[] = [];
  private interiorReturn?: Phaser.Math.Vector2;

  constructor(initialXp = 0) {
    super('Campus');
    // Restore the player's first-day story flags from the locally saved XP total.
    this.firstMissionComplete = initialXp >= 50;
    this.teacherMissionComplete = initialXp >= 100;
    this.homeroomMissionComplete = initialXp >= 200;
    this.orientationStarted = initialXp >= 250;
    this.orientationComplete = initialXp >= 350;
    this.libraryComplete = initialXp >= 400;
    this.cafeteriaComplete = initialXp >= 450;
    this.sportsComplete = initialXp >= 500;
  }

  create() {
    const { width: w, height: h } = this.scale;
    const g = this.add.graphics();
    this.drawCampusWorld(w, h, g);

    // Class D homeroom entrance: a visible, interactable destination for onboarding.
    this.homeroomX = w * 0.5;
    this.homeroomY = h * 0.49;
    g.lineStyle(3, 0xc8a8ff, 0.95);
    g.strokeCircle(this.homeroomX, this.homeroomY, 23);
    g.fillStyle(0x8f69ff, 0.16);
    g.fillCircle(this.homeroomX, this.homeroomY, 17);
    g.lineStyle(1, 0xffffff, 0.5);
    g.strokeCircle(this.homeroomX, this.homeroomY, 29);
    const homeroomPulse = this.add.circle(this.homeroomX, this.homeroomY, 31, 0xc8a8ff, 0).setStrokeStyle(1, 0xe3d5ff, 0.7);
    this.tweens.add({ targets: homeroomPulse, scale: 1.3, alpha: 0, duration: 1500, repeat: -1, ease: 'Sine.easeOut' });
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
    const orientationPulse = this.add.circle(this.classroomX, this.classroomY, 28, 0x79d9ff, 0).setStrokeStyle(1, 0x9be6ff, 0.75);
    this.tweens.add({ targets: orientationPulse, scale: 1.35, alpha: 0, duration: 1250, repeat: -1, ease: 'Sine.easeOut' });
    this.add.text(this.classroomX, this.classroomY - 38, 'CLASS D · ORIENTATION', {
      fontFamily: 'Arial', fontSize: '10px', color: '#d9f5ff',
      stroke: '#14233c', strokeThickness: 3,
    }).setOrigin(0.5);

    // Three explorable campus destinations extend the first-day chapter beyond onboarding.
    const addExploreMarker = (x: number, y: number, label: string, color: number) => {
      const marker = this.add.circle(x, y, 20, color, 0.12).setStrokeStyle(2, color, 0.9);
      this.tweens.add({ targets: marker, scale: 1.22, alpha: 0.45, duration: 1350, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.add.text(x, y - 34, label, {
        fontFamily: 'Arial', fontSize: '10px', color: '#ffffff',
        stroke: '#17162b', strokeThickness: 3,
      }).setOrigin(0.5);
    };
    this.libraryX = w * 0.2; this.libraryY = h * 0.34;
    this.cafeteriaX = w * 0.8; this.cafeteriaY = h * 0.34;
    this.sportsX = w * 0.2; this.sportsY = h * 0.69;
    addExploreMarker(this.libraryX, this.libraryY, 'LIBRARY', 0x9bdbff);
    addExploreMarker(this.cafeteriaX, this.cafeteriaY, 'CAFETERIA', 0xffc77d);
    addExploreMarker(this.sportsX, this.sportsY, 'SPORTS COURT', 0x8ce0b8);

    // Keep one clear destination marker; avoid duplicated homeroom labels.

    // Original hand-drawn student character rig.
    this.npcX = w * 0.5;
    this.npcY = h * 0.61;
    const npc = this.makeStudent(this.npcX, this.npcY, 0x6b86b5, 0x49354a, 0xe9c4b5);
    this.tweens.add({ targets: npc, y: this.npcY - 3, duration: 1450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(this.npcX, this.npcY - 43, 'CLASSMATE', {
      fontFamily: 'Arial', fontSize: '10px', color: '#ffffff',
      stroke: '#241a3b', strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 2, color: '#120d24', blur: 5, fill: true },
    }).setOrigin(0.5);

    // Teacher variant uses a different uniform, hair and glasses.
    this.teacherX = w * 0.78;
    this.teacherY = h * 0.61;
    const teacher = this.makeStudent(this.teacherX, this.teacherY, 0x34364f, 0x343047, 0xd9b49e, true);
    this.tweens.add({ targets: teacher, y: this.teacherY - 2, duration: 1750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(this.teacherX, this.teacherY - 46, 'TEACHER', {
      fontFamily: 'Arial', fontSize: '10px', color: '#fff4dc',
      stroke: '#241a3b', strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 2, color: '#120d24', blur: 5, fill: true },
    }).setOrigin(0.5);

    // Small campus crowd: each student is assembled from original rig layers,
    // with a distinct uniform/hair palette and staggered idle motion.
    const campusStudents = [
      { x: w * 0.36, y: h * 0.55, jacket: 0x7b536f, hair: 0x28253c, skin: 0xe6bda9, name: 'MIRA' },
      { x: w * 0.66, y: h * 0.54, jacket: 0x536b78, hair: 0x8b6044, skin: 0xf0c9ae, name: 'REN' },
      { x: w * 0.36, y: h * 0.83, jacket: 0x6d7655, hair: 0x332b2a, skin: 0xd9ad98, name: 'KAI' },
    ];
    campusStudents.forEach((student, index) => {
      const actor = this.makeStudent(student.x, student.y, student.jacket, student.hair, student.skin);
      actor.setDepth(student.y);
      this.tweens.add({ targets: actor, y: student.y - (index % 2 ? 2 : 3), duration: 1250 + index * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.add.text(student.x, student.y - 52, student.name, { fontFamily: 'Arial', fontSize: '8px', color: '#f5f0df', stroke: '#253c39', strokeThickness: 3 }).setOrigin(0.5);
    });

    // Player avatar is assembled from original Phaser-drawn layers.
    const px = w * 0.5, py = h * 0.78;
    this.player = this.makeStudent(px, py, 0x33294c, 0x201a31, 0xf0c8b5, false, true).setDepth(py);

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
      if (this.interiorMode && !(p.x > w - 135 && p.y > h - 155)) return;
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

  private drawCampusWorld(w: number, h: number, g: Phaser.GameObjects.Graphics) {
    // Entire academy environment is drawn in-engine: layered courtyards, paths,
    // architecture, landscaping and readable landmarks. No generated backdrop.
    g.fillStyle(0x789b78, 1); g.fillRect(0, 0, w, h);
    g.fillStyle(0x86a982, 0.7); g.fillRect(0, 0, w, h * 0.18);
    // Distant tree line and soft canopy clusters.
    for (let i = 0; i < 34; i++) {
      const x = (i * 137) % w; const y = 34 + (i % 4) * 12;
      g.fillStyle(i % 3 === 0 ? 0x52785e : 0x608765, 0.95);
      g.fillCircle(x, y, 24 + (i % 3) * 5);
      g.fillStyle(0xa0bd8c, 0.2); g.fillCircle(x - 7, y - 8, 11);
    }
    // Main stone promenade and branching paths.
    g.fillStyle(0x667f79, 0.35); g.fillRoundedRect(w * 0.455, 0, w * 0.09, h, 8);
    g.fillStyle(0xc9c4ad, 1); g.fillRoundedRect(w * 0.47, 0, w * 0.06, h, 5);
    g.fillStyle(0xe0d9c2, 0.8); g.fillRoundedRect(w * 0.08, h * 0.38, w * 0.84, h * 0.075, 9);
    g.fillRoundedRect(w * 0.08, h * 0.67, w * 0.84, h * 0.055, 8);
    g.fillRoundedRect(w * 0.13, h * 0.29, w * 0.74, h * 0.045, 7);
    // Courtyard paving tiles.
    g.lineStyle(1, 0xa59f8b, 0.24);
    for (let x = 30; x < w; x += 54) g.lineBetween(x, h * 0.39, x, h * 0.445);
    for (let x = 30; x < w; x += 54) g.lineBetween(x, h * 0.67, x, h * 0.725);
    // Main academy building at the northern edge.
    g.fillStyle(0x4a4c60, 0.32); g.fillRoundedRect(w * 0.29, h * 0.035, w * 0.42, h * 0.2, 10);
    g.fillStyle(0xddd7c8, 1); g.fillRoundedRect(w * 0.3, h * 0.02, w * 0.4, h * 0.19, 8);
    g.fillStyle(0x555c70, 1); g.fillRoundedRect(w * 0.285, h * 0.015, w * 0.43, h * 0.045, 6);
    g.fillStyle(0x9bafad, 1); g.fillRoundedRect(w * 0.465, h * 0.1, w * 0.07, h * 0.11, 4);
    g.fillStyle(0x3d5263, 1); g.fillRect(w * 0.485, h * 0.13, w * 0.03, h * 0.08);
    for (let i = 0; i < 7; i++) {
      const x = w * 0.33 + i * w * 0.055;
      g.fillStyle(0x7b9a9a, 1); g.fillRoundedRect(x, h * 0.08, w * 0.027, h * 0.07, 4);
      g.lineStyle(2, 0xf0e9d9, 0.9); g.lineBetween(x + w * 0.0135, h * 0.08, x + w * 0.0135, h * 0.15);
    }
    // Library, cafeteria and sports pavilion, each with distinct silhouettes.
    this.drawBuilding(g, w * 0.055, h * 0.19, w * 0.19, h * 0.15, 0x9caeb1, 0x526c7c, 'LIBRARY');
    this.drawBuilding(g, w * 0.755, h * 0.19, w * 0.19, h * 0.15, 0xd6b98f, 0x7a5944, 'CAFETERIA');
    this.drawBuilding(g, w * 0.055, h * 0.76, w * 0.21, h * 0.16, 0xa8b6a5, 0x49675d, 'SPORTS');
    // Sports court markings.
    g.fillStyle(0x668d82, 1); g.fillRoundedRect(w * 0.3, h * 0.78, w * 0.28, h * 0.16, 9);
    g.lineStyle(2, 0xe4e9d6, 0.85); g.strokeRoundedRect(w * 0.31, h * 0.79, w * 0.26, h * 0.14, 5);
    g.lineBetween(w * 0.44, h * 0.79, w * 0.44, h * 0.93);
    g.strokeCircle(w * 0.44, h * 0.86, 19);
    // Pond, fountain and stone edging in the eastern garden.
    g.fillStyle(0x4d716d, 0.4); g.fillEllipse(w * 0.83, h * 0.79, w * 0.19, h * 0.13);
    g.fillStyle(0x6aa6a5, 1); g.fillEllipse(w * 0.83, h * 0.78, w * 0.17, h * 0.105);
    g.lineStyle(3, 0xe2d9c1, 0.9); g.strokeEllipse(w * 0.83, h * 0.78, w * 0.18, h * 0.115);
    g.fillStyle(0xc9d8c7, 0.85); g.fillCircle(w * 0.83, h * 0.78, 9);
    g.fillStyle(0x8dc9c2, 0.8); g.fillCircle(w * 0.83, h * 0.78, 5);
    const pondRipple = this.add.ellipse(w * 0.83, h * 0.78, 25, 8, 0x9edbd4, 0).setStrokeStyle(1, 0xd8f2e8, 0.65);
    this.tweens.add({ targets: pondRipple, scaleX: 2.1, scaleY: 1.8, alpha: 0, duration: 2200, repeat: -1, ease: 'Sine.easeOut' });
    // Decorative trees with trunks, layered foliage and flower beds.
    for (const [x, y, r] of [[0.09,0.49,18],[0.23,0.52,15],[0.71,0.49,19],[0.94,0.53,18],[0.29,0.72,14],[0.68,0.72,15],[0.92,0.68,16],[0.14,0.91,15],[0.61,0.91,14]] as number[][]) {
      g.fillStyle(0x765b48, 1); g.fillRoundedRect(w*x-4, h*y, 8, 25, 3);
      g.fillStyle(0x426a50, 1); g.fillCircle(w*x, h*y-8, r);
      g.fillStyle(0x6f9868, 1); g.fillCircle(w*x-7, h*y-13, r*0.65);
      g.fillStyle(0x9dbb7b, 0.65); g.fillCircle(w*x-10, h*y-18, r*0.28);
    }
    for (let i = 0; i < 28; i++) {
      const x = ((i * 83) % Math.floor(w - 30)) + 15; const y = h * (0.47 + (i % 5) * 0.095);
      g.fillStyle(i % 2 ? 0xd9b6cf : 0xe8d29a, 0.85); g.fillCircle(x, y, 2.4);
    }
    // Benches and lampposts add scale and lived-in detail.
    for (const x of [w*0.36,w*0.64]) {
      g.fillStyle(0x665247, 1); g.fillRoundedRect(x-18,h*0.53,36,7,3);
      g.fillRect(x-14,h*0.54,4,10); g.fillRect(x+10,h*0.54,4,10);
    }
    for (const x of [w*0.27,w*0.73]) {
      g.fillStyle(0x4a5054, 1); g.fillRect(x-2,h*0.44,4,33);
      g.fillStyle(0xf4e4a9, 0.9); g.fillCircle(x,h*0.44,6);
      g.fillStyle(0xffefc5, 0.16); g.fillCircle(x,h*0.44,13);
    }
    // Soft foreground vignette to frame the playable space.
    g.fillStyle(0x172b2b, 0.08); g.fillRect(0, h*0.94, w, h*0.06);
  }

  private drawBuilding(g: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, wall: number, roof: number, label: string) {
    g.fillStyle(0x263d3d, 0.24); g.fillRoundedRect(x+5,y+7,width,height,7);
    g.fillStyle(wall, 1); g.fillRoundedRect(x,y+10,width,height-10,6);
    g.fillStyle(roof, 1); g.fillRoundedRect(x-5,y,width+10,18,5);
    g.fillStyle(0x465e68, 1); g.fillRoundedRect(x+width*0.39,y+height*0.43,width*0.22,height*0.57,3);
    for(let i=0;i<3;i++) {
      g.fillStyle(0x789da0,1); g.fillRoundedRect(x+12+i*(width-34)/3,y+25,(width-48)/3,24,3);
      g.lineStyle(1,0xe9e4d2,0.8); g.strokeRect(x+12+i*(width-34)/3,y+25,(width-48)/3,24);
    }
    this.add.text(x+width/2,y+height+7,label,{fontFamily:'Arial',fontSize:'9px',fontStyle:'bold',color:'#f5f0df',stroke:'#253c39',strokeThickness:3}).setOrigin(0.5);
  }

  private makeStudent(x: number, y: number, jacket: number, hair: number, skin: number, teacher = false, player = false) {
    const shadow = this.add.ellipse(0, 18, 33, 12, 0x17251f, 0.35);
    const legs = this.add.graphics();
    legs.fillStyle(0x272b3d,1); legs.fillRoundedRect(-9,-1,7,14,2); legs.fillRoundedRect(2,-1,7,14,2);
    legs.fillStyle(0x1d202c,1); legs.fillRoundedRect(-11,10,10,5,2); legs.fillRoundedRect(1,10,10,5,2);
    legs.fillStyle(0x62657a,0.7); legs.fillRect(-10,11,5,1); legs.fillRect(2,11,5,1);
    legs.setPosition(0,17);
    const arms = this.add.graphics();
    arms.fillStyle(jacket,1); arms.fillRoundedRect(-17,-1,7,18,3); arms.fillRoundedRect(10,-1,7,18,3);
    arms.fillStyle(skin,1); arms.fillRoundedRect(-17,13,7,6,2); arms.fillRoundedRect(10,13,7,6,2);
    arms.setPosition(0,-3);
    const art = this.add.graphics();
    // Blazer silhouette, shirt and collar.
    art.fillStyle(jacket,1); art.fillRoundedRect(-14,-5,28,28,7);
    art.fillStyle(0xf2eee5,1); art.fillTriangle(-8,-3,0,8,8,-3); art.fillTriangle(-8,-3,-5,13,0,8); art.fillTriangle(8,-3,5,13,0,8);
    art.fillStyle(teacher ? 0x9a6b4e : 0x7863b7,1); art.fillTriangle(-2,2,2,2,1,16); art.fillTriangle(-2,2,1,16,-1,18);
    art.fillStyle(0xd6b46f,1); art.fillCircle(-9,5,1.8);
    // Neck and face.
    art.fillStyle(skin,1); art.fillRoundedRect(-4,-13,8,10,3); art.fillEllipse(0,-23,21,25);
    // Ears and facial features.
    art.fillStyle(skin,1); art.fillCircle(-10,-23,3); art.fillCircle(10,-23,3);
    art.fillStyle(0x302c39,1); art.fillEllipse(-4,-23,2.2,3.2); art.fillEllipse(4,-23,2.2,3.2);
    art.lineStyle(1,0x9b655c,0.8); art.lineBetween(-1,-17,2,-17);
    art.fillStyle(0xe89a91,0.38); art.fillCircle(-7,-19,2); art.fillCircle(7,-19,2);
    // Distinctive swept fringe and layered hair silhouette.
    art.fillStyle(hair,1); art.fillEllipse(0,-32,25,13);
    art.fillTriangle(-12,-29,-10,-43,0,-32); art.fillTriangle(-4,-29,2,-45,5,-29);
    art.fillTriangle(2,-29,12,-40,10,-25); art.fillTriangle(-11,-25,-15,-31,-12,-17);
    art.fillStyle(0xffffff,0.16); art.fillEllipse(-5,-38,8,3);
    if (teacher) { art.lineStyle(2,0xd7d1c8,0.95); art.strokeRoundedRect(-12,-25,9,7,3); art.strokeRoundedRect(3,-25,9,7,3); art.lineBetween(-3,-22,3,-22); }
    if (player) {
      art.lineStyle(2,0xe5d8ff,0.9); art.strokeRoundedRect(-15,-6,30,30,7);
      art.fillStyle(0xe3c77e,1); art.fillCircle(9,1,2.2);
    }
    const character = this.add.container(x,y,[shadow,legs,arms,art]);
    character.setSize(36,52);
    if (player) {
      this.playerLegs = legs; this.playerArms = arms;
      this.tweens.add({targets:art,y:1.5,duration:1050,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      this.tweens.add({targets:shadow,scaleX:0.92,alpha:0.27,duration:1050,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    }
    return character;
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

  private openInterior(name: string) {
    if (!this.player) return;
    this.interiorMode = name;
    this.interiorReturn = new Phaser.Math.Vector2(this.player.x, this.player.y);
    this.target = undefined;
    this.moveX = 0; this.moveY = 0;
    this.player.setPosition(this.scale.width * 0.5, this.scale.height * 0.79).setDepth(260);
    const w = this.scale.width, h = this.scale.height;
    const room = this.add.graphics().setDepth(200);
    room.fillStyle(0x18232b, 1); room.fillRect(0, 0, w, h);
    room.fillStyle(name === 'CAFETERIA' ? 0x80664d : name === 'LIBRARY' ? 0x5c6f78 : 0x52675d, 1);
    room.fillRoundedRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84, 18);
    room.fillStyle(0xd7c9ad, 1); room.fillRoundedRect(w * 0.11, h * 0.11, w * 0.78, h * 0.78, 12);
    room.fillStyle(0x9b8c77, 1); room.fillRect(w * 0.11, h * 0.68, w * 0.78, h * 0.23);
    room.fillStyle(0x4b5365, 1); room.fillRoundedRect(w * 0.43, h * 0.1, w * 0.14, h * 0.11, 5);
    room.fillStyle(0x8eb4ba, 1); room.fillRoundedRect(w * 0.445, h * 0.115, w * 0.11, h * 0.08, 3);
    if (name === 'LIBRARY') {
      for (let row = 0; row < 2; row++) for (let i = 0; i < 7; i++) {
        const x = w * 0.16 + i * w * 0.1, y = h * (0.29 + row * 0.19);
        room.fillStyle(0x654c3c, 1); room.fillRoundedRect(x, y, w * 0.075, h * 0.13, 3);
        for (let j = 0; j < 4; j++) { room.fillStyle([0x8b5c55,0x526d84,0xb18b56,0x647d69][(i+j)%4],1); room.fillRect(x+5+j*7,y+7,5,h*0.09); }
      }
      room.fillStyle(0x765d4a,1); room.fillRoundedRect(w*0.37,h*0.59,w*0.26,h*0.055,5);
    } else if (name === 'CAFETERIA') {
      for (let i = 0; i < 3; i++) { const x=w*(0.25+i*0.25); room.fillStyle(0x76523b,1); room.fillEllipse(x,h*0.48,90,24); room.fillRect(x-35,h*0.49,5,35); room.fillRect(x+30,h*0.49,5,35); room.fillStyle(0xf0dfc0,1); room.fillCircle(x,h*0.465,5); }
      room.fillStyle(0x8a6042,1); room.fillRoundedRect(w*0.24,h*0.25,w*0.52,h*0.07,5);
    } else {
      room.fillStyle(0x5e876f,1); room.fillRoundedRect(w*0.22,h*0.26,w*0.56,h*0.34,12);
      room.lineStyle(3,0xf1e9d5,0.9); room.strokeRoundedRect(w*0.24,h*0.28,w*0.52,h*0.30,8); room.lineBetween(w*0.5,h*0.28,w*0.5,h*0.58); room.strokeCircle(w*0.5,h*0.43,34);
      room.fillStyle(0x7a5a42,1); room.fillRoundedRect(w*0.14,h*0.19,w*0.08,h*0.05,3); room.fillRoundedRect(w*0.78,h*0.19,w*0.08,h*0.05,3);
    }
    const title = this.add.text(w*0.5,h*0.045,name,{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color:'#fff5df',stroke:'#28323c',strokeThickness:5}).setOrigin(0.5).setDepth(220);
    const hint = this.add.text(w*0.5,h*0.95,'PRESS TALK TO RETURN TO CAMPUS',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#fff5df',stroke:'#28323c',strokeThickness:4}).setOrigin(0.5).setDepth(220);
    this.interiorObjects = [room,title,hint];
    this.dialogue?.setText(name === 'LIBRARY' ? 'The academy archive: shelves of course records and old campus histories.' : name === 'CAFETERIA' ? 'The cafeteria is a lively meeting point between lessons.' : 'The sports hall hosts club practice and inter-class events.');
  }

  private closeInterior() {
    if (!this.interiorMode) return;
    this.interiorObjects.forEach(object => object.destroy());
    this.interiorObjects = [];
    this.interiorMode = null;
    if (this.player && this.interiorReturn) this.player.setPosition(this.interiorReturn.x, this.interiorReturn.y).setDepth(this.interiorReturn.y);
    this.dialogue?.setText('Back on campus. Continue exploring your academy.');
  }

  private interact() {
    if (!this.player || !this.dialogue) return;
    if (this.interiorMode) { this.closeInterior(); return; }
    const classmateDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npcX, this.npcY);
    const teacherDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.teacherX, this.teacherY);
    const homeroomDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.homeroomX, this.homeroomY);
    const classroomDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.classroomX, this.classroomY);
    const libraryDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.libraryX, this.libraryY);
    const cafeteriaDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.cafeteriaX, this.cafeteriaY);
    const sportsDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.sportsX, this.sportsY);
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
      this.game.events.emit('mission-complete', { xp: 100, nextObjective: 'Explore the library in the west courtyard' });
    } else if (this.orientationComplete && !this.libraryComplete && libraryDistance < 95) {
      this.dialogue.setText('Library: The academy archive holds course records, club notices, and clues about the campus. Your exploration begins here.');
      this.libraryComplete = true;
      this.game.events.emit('mission-complete', { xp: 50, nextObjective: 'Visit the cafeteria on the east side' });
      this.openInterior('LIBRARY');
    } else if (this.libraryComplete && !this.cafeteriaComplete && cafeteriaDistance < 95) {
      this.dialogue.setText('Cafeteria: Students gather here between lessons. You have found another important part of academy life.');
      this.cafeteriaComplete = true;
      this.game.events.emit('mission-complete', { xp: 50, nextObjective: 'Explore the sports court in the south-west' });
      this.openInterior('CAFETERIA');
    } else if (this.cafeteriaComplete && !this.sportsComplete && sportsDistance < 95) {
      this.dialogue.setText('Sports Court: Clubs and inter-class competitions are held here. Foundation Campus exploration complete.');
      this.sportsComplete = true;
      this.game.events.emit('mission-complete', { xp: 50, nextObjective: 'Chapter 1 complete — await the next academy event' });
      this.openInterior('SPORTS');
    } else if (classmateDistance >= 125 && teacherDistance >= 125 && homeroomDistance >= 105 && classroomDistance >= 110 && libraryDistance >= 95 && cafeteriaDistance >= 95 && sportsDistance >= 95) {
      this.dialogue.setText('Move closer to the highlighted character or campus destination to interact.');
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
    } else if (!this.libraryComplete) {
      this.dialogue.setText('Explore the library in the west courtyard. Follow the blue marker.');
    } else if (!this.cafeteriaComplete) {
      this.dialogue.setText('Visit the cafeteria on the east side. Follow the gold marker.');
    } else if (!this.sportsComplete) {
      this.dialogue.setText('Explore the sports court in the south-west. Follow the green marker.');
    } else {
      this.dialogue.setText('Chapter 1 complete. Your academy journey begins here.');
    }
    this.dialogueTimer?.remove(false);
    this.dialogueTimer = this.time.delayedCall(3800, () => this.dialogue?.setText(''));
  }

  update(_time: number, delta: number) {
    if (!this.player) return;
    let dx = this.interiorMode ? 0 : this.moveX, dy = this.interiorMode ? 0 : this.moveY;
    if (!this.interiorMode && (this.cursors?.left.isDown || this.keys?.A.isDown)) dx = -1;
    if (!this.interiorMode && (this.cursors?.right.isDown || this.keys?.D.isDown)) dx = 1;
    if (!this.interiorMode && (this.cursors?.up.isDown || this.keys?.W.isDown)) dy = -1;
    if (!this.interiorMode && (this.cursors?.down.isDown || this.keys?.S.isDown)) dy = 1;
    const speed = delta * 0.19;
    const moving = Math.abs(dx) + Math.abs(dy) > 0.02 || Boolean(this.target && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y) >= 4);
    if (dx || dy) {
      this.target = undefined;
      const len = Math.hypot(dx, dy);
      this.player.x += dx / len * speed; this.player.y += dy / len * speed;
      if (Math.abs(dx) > 0.05) this.facing = dx < 0 ? -1 : 1;
    } else if (this.target) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
      if (d < 4) this.target = undefined;
      else {
        const a = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.target.x, this.target.y);
        this.player.x += Math.cos(a) * speed; this.player.y += Math.sin(a) * speed;
        if (Math.abs(Math.cos(a)) > 0.05) this.facing = Math.cos(a) < 0 ? -1 : 1;
      }
    }
    this.player.setScale(this.facing, 1);
    if (moving) {
      this.walkClock += delta * 0.012;
      const stride = Math.sin(this.walkClock) * 0.62;
      if (this.playerLegs) this.playerLegs.rotation = stride;
      if (this.playerArms) this.playerArms.rotation = -stride * 0.72;
    } else {
      if (this.playerLegs) this.playerLegs.rotation = Phaser.Math.Linear(this.playerLegs.rotation, 0, 0.25);
      if (this.playerArms) this.playerArms.rotation = Phaser.Math.Linear(this.playerArms.rotation, 0, 0.25);
    }
    this.player.x = Phaser.Math.Clamp(this.player.x, 22, this.scale.width - 22);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.scale.height * 0.19, this.scale.height - 42);
    this.player.setDepth(this.player.y);
  }
}

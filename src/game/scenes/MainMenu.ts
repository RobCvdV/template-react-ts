import { GameObjects, Scene } from "phaser";
import { Block, EventBus } from "@game";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Shape | GameObjects.Sprite | GameObjects.Image;
  title: GameObjects.Text;
  logoTween: Phaser.Tweens.Tween | null;

  block: Block;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.background = this.add.image(300, 600, "background");

    // this.logo = this.add
    //   .sprite(100, 100, "heart-block")
    //   .setDepth(100)
    //   .setScale(1)
    //   .setTint(Color.ValueToColor("rgb(255, 130, 255)").color);
    //
    // this.block = Block.create(this, {
    //   x: 212,
    //   y: 200,
    //   color: 2,
    //   type: 3,
    // });

    // this.add.existing(this.block);

    this.title = this.add
      .text(212, 1060, "Main Menu", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    if (this.logoTween) {
      this.logoTween.stop();
      this.logoTween = null;
    }

    this.scene.start("ZwapGame");
  }

  moveLogo(vueCallback: ({ x, y }: { x: number; y: number }) => void) {
    if (this.logoTween) {
      if (this.logoTween.isPlaying()) {
        this.logoTween.pause();
      } else {
        this.logoTween.play();
      }
    } else {
      // this.logoTween = this.tweens.add({
      //     targets: this.logo,
      //     x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
      //     y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
      //     yoyo: true,
      //     repeat: -1,
      // });
      this.logoTween = this.tweens.add({
        targets: this.logo,
        rotation: 0.3,
        x: { value: 750, duration: 3000, ease: "Back.easeInOut" },
        y: { value: 80, duration: 1500, ease: "Sine.easeOut" },
        duration: 100,
        yoyo: true,

        onUpdate: (tw) => {
          // console.log("onUpdate", tw.);
          if (vueCallback) {
            vueCallback({
              x: Math.floor(this.logo.x),
              y: Math.floor(this.logo.y),
            });
          }
        },
        repeat: -1,
      });
    }
  }
}

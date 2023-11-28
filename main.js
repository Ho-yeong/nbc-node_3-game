import { Engine, Render, Runner, Body, Bodies, World, Events } from 'matter-js';
import { FRUITS } from './fruits.js';
// 기본 + 프레임 세팅
const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: '#D070FB',
    width: 620,
    height: 850,
  },
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 795, {
  isStatic: true,
  render: { fillStyle: '#b623f7' },
});

const rightWall = Bodies.rectangle(605, 395, 30, 795, {
  isStatic: true,
  render: { fillStyle: '#b623f7' },
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: '#b623f7' },
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  isStatic: true,
  isSensor: true,
  render: { fillStyle: '#b623f7' },
  label: 'topLine',
});

let currentBody;
let currentFruit;
let disableAction = false;

function addFruit() {
  const index = Math.floor(Math.random() * 10);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index,
    // 준비
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: 0.5,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

World.add(world, [leftWall, rightWall, ground, topLine]);
Render.run(render);
Runner.run(engine);

window.onkeydown = (e) => {
  if (disableAction) {
    return;
  }
  switch (e.code) {
    case 'KeyA':
      if (currentBody.position.x - currentFruit.radius > 30) {
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 10,
          y: currentBody.position.y,
        });
      }
      break;
    case 'KeyD':
      if (currentBody.position.x + currentFruit.radius < 590) {
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 10,
          y: currentBody.position.y,
        });
      }
      break;
    case 'KeyS':
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
};

Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    // 같은 과일이 부딪힐때
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index === FRUITS.length + 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const body = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          index: index + 1,
          render: {
            sprite: { texture: `${newFruit.name}.png` },
          },
          restitution: 0.5,
        },
      );

      World.add(world, body);
    }

    // 패배조건
    if (
      (collision.bodyA.label === 'topLine' || collision.bodyB.label === 'topLine') &&
      !disableAction
    ) {
      alert('Game over');
    }
  });
});

addFruit();

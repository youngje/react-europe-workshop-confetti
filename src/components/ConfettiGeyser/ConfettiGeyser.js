import React from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';

import usePhysicsEngine from '../../hooks/use-physics-engine.hook';
import { sample, normalize, random } from '../../utils';
import DEFAULT_SPRITES from './default-sprites';

const convertDegreesToRadians = angle => (angle * Math.PI) / 180;

const ConfettiGeyser = ({
  // The position for the geyser.
  // Specified as a tuple-like array, [top, left]
  position,

  // How fast each particle should be moving
  velocity,

  // How much each particle should be rotating
  angularVelocity,

  // The direction that the geyser should be facing
  angle,

  // The amount of deviation from the specified angle
  spread,

  // The amount of deviation from the specified velocity
  volatility,

  // The number, in milliseconds, for the geyser to run for.
  duration,

  // The rate of particles fired, specified as # per second
  // 4: slow
  // 15: moderate
  // 30: intense
  concentration,

  // An array of image paths to use for sprites
  // max size per sprite: 20x20
  sprites = DEFAULT_SPRITES,
}) => {
  const canvasRef = React.useRef(null);

  const [engine, renderer] = usePhysicsEngine(canvasRef);

  React.useEffect(() => {
    const [top, left] = position;

    if (!engine) {
      return;
    }

    // how many ms needs to pass between each frame?
    const timePerFrame = 1000 / concentration;

    const startAt = performance.now();

    let timeoutId = window.setInterval(() => {
      if (performance.now() - startAt > duration) {
        window.clearInterval(timeoutId);
        return;
      }

      const confettiPiece = Matter.Bodies.rectangle(top, left, 20, 20, {
        frictionAir: 0.04,
        collisionFilter: {
          category: null,
        },
        render: {
          sprite: {
            texture: sample(sprites),
            xScale: 1,
            yScale: 1,
          },
        },
      });

      const spreadPercentile = Math.random();
      const velocityPercentile = Math.random();

      const imperfectAngle = normalize(
        spreadPercentile,
        0,
        1,
        angle - spread / 2,
        angle + spread / 2
      );

      let imperfectVelocity = normalize(
        velocityPercentile,
        0,
        1,
        velocity - velocity * volatility,
        velocity + velocity * volatility
      );

      const angleInRads = convertDegreesToRadians(imperfectAngle);

      const x = Math.cos(angleInRads) * imperfectVelocity;
      const y = Math.sin(angleInRads) * imperfectVelocity;

      Matter.Body.setVelocity(confettiPiece, {
        x,
        y,
      });

      const imperfectAngularVelocity = angularVelocity * velocityPercentile;

      Matter.Body.setAngularVelocity(confettiPiece, imperfectAngularVelocity);

      Matter.World.add(engine.world, [confettiPiece]);
    }, timePerFrame);
  }, [engine]);

  return (
    <Wrapper>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export default ConfettiGeyser;
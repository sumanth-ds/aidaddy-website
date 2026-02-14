import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

const Hero = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Transform Your Business with AI';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero} id="home">
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1>
              <span className={styles.typingText}>{displayText}</span>
              <span className={styles.cursor}>|</span>
            </h1>
            <p>Unlock the power of artificial intelligence to automate processes, gain insights, and drive growth for your business.</p>
            <div className={styles.heroButtons}>
              <Link to="/get-started" className={styles.ctaButton}>Get Started</Link>
              <a href="#services" className={styles.secondaryButton}>Learn More</a>
              <a href="https://agenti-frontend.vercel.app/" className={styles.secondaryButton}>Our Free Agent</a>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.robotWrapper}>
              {/* Main Robot Container */}
              <div className={styles.realRobot}>
                {/* Head */}
                <div className={styles.robotHeadReal}>
                  {/* Forehead Panel */}
                  <div className={styles.foreheadPanel}>
                    <div className={styles.sensorDot}></div>
                    <div className={styles.sensorLine}></div>
                  </div>

                  {/* Eyes */}
                  <div className={styles.eyesContainer}>
                    <div className={styles.eyeRealLeft}>
                      <div className={styles.pupil}>
                        <div className={styles.pupilHighlight}></div>
                      </div>
                      <div className={styles.eyeGlow}></div>
                    </div>
                    <div className={styles.eyeRealRight}>
                      <div className={styles.pupil}>
                        <div className={styles.pupilHighlight}></div>
                      </div>
                      <div className={styles.eyeGlow}></div>
                    </div>
                  </div>

                  {/* Nose */}
                  <div className={styles.noseSensor}>
                    <div className={styles.noseLight}></div>
                  </div>

                  {/* Mouth */}
                  <div className={styles.mouthReal}>
                    <div className={styles.mouthLine}></div>
                    <div className={styles.mouthLine}></div>
                    <div className={styles.mouthLine}></div>
                  </div>

                  {/* Ear Panels */}
                  <div className={styles.earPanelLeft}>
                    <div className={styles.earLight}></div>
                  </div>
                  <div className={styles.earPanelRight}>
                    <div className={styles.earLight}></div>
                  </div>
                </div>

                {/* Neck */}
                <div className={styles.robotNeck}>
                  <div className={styles.neckSegment}></div>
                  <div className={styles.neckSegment}></div>
                  <div className={styles.neckSegment}></div>
                </div>

                {/* Body */}
                <div className={styles.robotBodyReal}>
                  {/* Shoulder Left */}
                  <div className={styles.shoulderLeft}>
                    <div className={styles.shoulderJoint}></div>
                    <div className={styles.armReal}>
                      <div className={styles.armSegment}></div>
                      <div className={styles.armSegment}></div>
                      <div className={styles.handReal}>
                        <div className={styles.finger}></div>
                        <div className={styles.finger}></div>
                        <div className={styles.finger}></div>
                        <div className={styles.fingerThumb}></div>
                      </div>
                    </div>
                  </div>

                  {/* Torso */}
                  <div className={styles.torsoReal}>
                    {/* Chest Panel */}
                    <div className={styles.chestPanel}>
                      <div className={styles.chestScreen}>
                        <div className={styles.screenLine}></div>
                        <div className={styles.screenLine}></div>
                        <div className={styles.screenLine}></div>
                        <div className={styles.aiText}>AI</div>
                      </div>
                      <div className={styles.chestLights}>
                        <div className={styles.chestLight}></div>
                        <div className={styles.chestLight}></div>
                        <div className={styles.chestLight}></div>
                      </div>
                    </div>

                    {/* Core */}
                    <div className={styles.coreUnit}>
                      <div className={styles.coreRing}></div>
                      <div className={styles.coreGlow}></div>
                    </div>

                    {/* Abdomen */}
                    <div className={styles.abdomenPanel}>
                      <div className={styles.ventLine}></div>
                      <div className={styles.ventLine}></div>
                      <div className={styles.ventLine}></div>
                    </div>
                  </div>

                  {/* Shoulder Right */}
                  <div className={styles.shoulderRight}>
                    <div className={styles.shoulderJoint}></div>
                    <div className={styles.armRealRight}>
                      <div className={styles.armSegment}></div>
                      <div className={styles.armSegment}></div>
                      <div className={styles.handReal}>
                        <div className={styles.finger}></div>
                        <div className={styles.finger}></div>
                        <div className={styles.finger}></div>
                        <div className={styles.fingerThumb}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hip */}
                <div className={styles.robotHip}>
                  <div className={styles.hipPanel}></div>
                </div>

                {/* Legs */}
                <div className={styles.legsContainer}>
                  <div className={styles.legLeft}>
                    <div className={styles.thigh}>
                      <div className={styles.kneeJoint}></div>
                    </div>
                    <div className={styles.calf}>
                      <div className={styles.footReal}>
                        <div className={styles.footPlate}></div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.legRight}>
                    <div className={styles.thigh}>
                      <div className={styles.kneeJoint}></div>
                    </div>
                    <div className={styles.calf}>
                      <div className={styles.footReal}>
                        <div className={styles.footPlate}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hologram Base */}
              <div className={styles.hologramBase}>
                <div className={styles.hologramRing}></div>
                <div className={styles.hologramRing}></div>
                <div className={styles.hologramRing}></div>
              </div>

              {/* Floating Particles */}
              <div className={styles.particleA}></div>
              <div className={styles.particleB}></div>
              <div className={styles.particleC}></div>
              <div className={styles.particleD}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

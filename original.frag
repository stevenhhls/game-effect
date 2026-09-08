// @name: ImpactRipple
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform sampler2D u_Sampler;
    uniform vec2 u_Center;
    uniform float u_Radius;
    uniform float u_Amplitude;
    uniform float u_WaveWidth;
    uniform float u_Frequency;
    uniform float u_Aspect;
    varying vec2 v_TexCoord;

    void main() {
      vec2 offset = v_TexCoord - u_Center;
      offset.x *= u_Aspect;
      float distanceFromCenter = length(offset);
      if (distanceFromCenter < 0.0001) {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
        return;
      }

      float distanceFromWaveFront = distanceFromCenter - u_Radius;
      float waveBand = exp(-pow(distanceFromWaveFront / max(u_WaveWidth, 0.0001), 2.0));
      float wave = sin(distanceFromWaveFront * u_Frequency);
      vec2 direction = normalize(offset);
      direction.x /= u_Aspect;
      vec2 uv = v_TexCoord + direction * wave * waveBand * u_Amplitude;
      gl_FragColor = texture2D(u_Sampler, uv);
    }

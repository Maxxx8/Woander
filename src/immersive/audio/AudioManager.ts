import { Howl, Howler } from 'howler';

export type SoundCategory = 'mountain' | 'beach' | 'forest' | 'desert' | 'city' | 'ui';

interface Sound {
  id: string;
  howl: Howl;
  category: SoundCategory;
  volume: number;
}

class AudioManagerClass {
  private sounds: Map<string, Sound> = new Map();
  private masterVolume: number = 0.5;
  private categoryVolumes: Map<SoundCategory, number> = new Map([
    ['mountain', 0.7],
    ['beach', 0.7],
    ['forest', 0.7],
    ['desert', 0.7],
    ['city', 0.7],
    ['ui', 0.3],
  ]);
  private currentAmbient: string | null = null;
  private enabled: boolean = false;

  constructor() {
    Howler.volume(this.masterVolume);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);
  }

  setCategoryVolume(category: SoundCategory, volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    this.categoryVolumes.set(category, normalizedVolume);

    this.sounds.forEach((sound) => {
      if (sound.category === category) {
        sound.howl.volume(normalizedVolume * sound.volume);
      }
    });
  }

  loadSound(
    id: string,
    src: string | string[],
    category: SoundCategory,
    options: {
      loop?: boolean;
      volume?: number;
      sprite?: { [key: string]: [number, number] };
    } = {}
  ): void {
    if (this.sounds.has(id)) {
      console.warn(`Sound with id "${id}" already exists`);
      return;
    }

    const volume = options.volume ?? 1;
    const categoryVolume = this.categoryVolumes.get(category) ?? 1;

    const howl = new Howl({
      src,
      loop: options.loop ?? false,
      volume: volume * categoryVolume,
      sprite: options.sprite,
      html5: true,
    });

    this.sounds.set(id, {
      id,
      howl,
      category,
      volume,
    });
  }

  play(id: string, sprite?: string): number | undefined {
    if (!this.enabled) return;

    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Sound with id "${id}" not found`);
      return;
    }

    return sound.howl.play(sprite);
  }

  pause(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.howl.pause();
    }
  }

  stop(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.howl.stop();
    }
  }

  stopAll(): void {
    this.sounds.forEach((sound) => {
      sound.howl.stop();
    });
  }

  fade(id: string, from: number, to: number, duration: number): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.howl.fade(from, to, duration);
    }
  }

  playAmbient(category: SoundCategory, fadeIn: boolean = true): void {
    if (!this.enabled) return;

    if (this.currentAmbient) {
      if (fadeIn) {
        this.fade(this.currentAmbient, this.masterVolume, 0, 1000);
        setTimeout(() => {
          if (this.currentAmbient) {
            this.stop(this.currentAmbient);
          }
        }, 1000);
      } else {
        this.stop(this.currentAmbient);
      }
    }

    const ambientId = `ambient_${category}`;
    const sound = this.sounds.get(ambientId);

    if (sound) {
      if (fadeIn) {
        sound.howl.volume(0);
        sound.howl.play();
        this.fade(ambientId, 0, sound.volume, 1000);
      } else {
        sound.howl.play();
      }

      this.currentAmbient = ambientId;
    }
  }

  stopAmbient(fadeOut: boolean = true): void {
    if (!this.currentAmbient) return;

    if (fadeOut) {
      this.fade(this.currentAmbient, this.masterVolume, 0, 1000);
      setTimeout(() => {
        if (this.currentAmbient) {
          this.stop(this.currentAmbient);
          this.currentAmbient = null;
        }
      }, 1000);
    } else {
      this.stop(this.currentAmbient);
      this.currentAmbient = null;
    }
  }

  playUISound(type: 'click' | 'hover' | 'success' | 'error'): void {
    if (!this.enabled) return;

    const soundId = `ui_${type}`;
    this.play(soundId);
  }

  unload(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.howl.unload();
      this.sounds.delete(id);
    }
  }

  unloadAll(): void {
    this.sounds.forEach((sound) => {
      sound.howl.unload();
    });
    this.sounds.clear();
  }
}

export const AudioManager = new AudioManagerClass();

export const initializeAudio = () => {
  // Note: Actual audio files would need to be hosted
  // These are placeholder URLs - replace with real audio sources

  AudioManager.loadSound(
    'ui_click',
    ['./sounds/ui/click.mp3'],
    'ui',
    { volume: 0.5 }
  );

  AudioManager.loadSound(
    'ui_hover',
    ['./sounds/ui/hover.mp3'],
    'ui',
    { volume: 0.3 }
  );

  AudioManager.loadSound(
    'ui_success',
    ['./sounds/ui/success.mp3'],
    'ui',
    { volume: 0.6 }
  );

  AudioManager.loadSound(
    'ui_error',
    ['./sounds/ui/error.mp3'],
    'ui',
    { volume: 0.6 }
  );

  // Placeholder URLs for ambient sounds
  AudioManager.loadSound(
    'ambient_mountain',
    ['./sounds/ambient/mountain.mp3'],
    'mountain',
    { loop: true, volume: 0.7 }
  );

  AudioManager.loadSound(
    'ambient_beach',
    ['./sounds/ambient/beach.mp3'],
    'beach',
    { loop: true, volume: 0.7 }
  );

  AudioManager.loadSound(
    'ambient_forest',
    ['./sounds/ambient/forest.mp3'],
    'forest',
    { loop: true, volume: 0.7 }
  );

  AudioManager.loadSound(
    'ambient_desert',
    ['./sounds/ambient/desert.mp3'],
    'desert',
    { loop: true, volume: 0.7 }
  );
};

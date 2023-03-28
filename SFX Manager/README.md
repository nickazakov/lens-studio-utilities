# SFX Manager

Feel free to use this plug & play lightweight SFX manager in your experience.
<br/>
Developed in **Lens Studio 4.43**

## How to use

Drag the **SFX Manager.lso** file under all objects in the **Objects** panel in **Lens Studio**.
<br/>
To play audio from any script, use:
```
global.playSfx(soundArrayId, timesPlayed, volume);
```
I.e. if we want to play the first audio in our **Sounds** array once and with full volume, we'd write:
```
global.playSfx(0, 1, 1);
```
Modify the manager script directly in the **Inspector** panel.
<br/>
Available Settings:
<ul>
    <li>Choose whether you want to select a looping background audio</li>
    <li>Enable MAI (Multiple Audio Instances) - allows multiple instances of the same sfx to be played all at once</li>
</ul>

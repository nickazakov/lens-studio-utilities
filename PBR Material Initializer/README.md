# PBR Material Initializer

Feel free to use this lightweight PBR Material Initializer in your experience to save some project space.
<br/>
Developed in **Lens Studio 4.43**

## How to use

Drag the **PBR Material Initializer.lso** file into the **Objects** panel.
<br/>
For the best results, keep the **PBR Initializer** object at the bottom of the **Objects** panel and make sure that all the scene objects you want to render with initialized materials have no materials applied to them. This asset saves project size by not creating separate resource copies of a PBR material for different scene objects.
<br/>
To clear a scene object's material:
<ul>
    <li>Select the scene object</li>
    <li>Right-click on the selected material in the **Inspector** panel</li>
    <li>Click on the "Clear" option in the dropdown menu</li>
</ul>
<br/>
Available Settings:
<ul>
    <li>Target Object: The scene object which the initialized material is applied to</li>
    <li>Material: The material that is initialized, use the "Lightweight PBR Material"</li>
    <li>Base Texture: The base texture that the material is initialized with</li>
    <li>Normal Texture: The normal texture that the material is initialized with, select "No Normal" if you won't be using one</li>
    <li>Metallic Slider: The metallic property of the initialized material [0.00 - 1.00f]</li>
    <li>Roughness Slider: The roughness property of the initialized material [0.00 - 1.00f]</li>
</ul>
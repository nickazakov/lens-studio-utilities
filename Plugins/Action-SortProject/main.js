//@ts-nocheck
import CoreService from "LensStudio:CoreService";
import * as Ui from "LensStudio:Ui";
import * as FileSystem from "LensStudio:FileSystem";

// Add a menu item [Replace] to the context menu of items in the Asset Browser
// But, there is a caveat: textures in materials won't be replaced. this is due to how we handle materials in Lens Studio
export class AssetMenuItem extends CoreService {
    static descriptor() {
        return {
            id: "com.nickazak.autoSort",
            interfaces: CoreService.descriptor().interfaces,
            name: "AutoSort Project",
            description: "Adds a Sort Project action to the context menu of items in the Asset Browser for automatically sorting the project assets into folders by type.",
            dependencies: [Editor.IContextActionRegistry, Editor.IEntityPicker, Editor.Model.IModel]
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem) {
        super(pluginSystem);
        this.pluginSystem = pluginSystem;
        this.dialogActive = false;
        this.dialogWindow = null;
    }

    createAssetAction(context) {

        // Because we are trying to add a new action to the context menu of the Asset Browser,
        // check if the context is of type AssetContext. If not, return an empty action.
        if (!context.isOfType("AssetContext")) {
            return new Editor.ContextAction();
        }

        // This is the action that will be added to the context menu.
        const action = new Editor.ContextAction();
        action.id = "Action.SortProject";
        action.caption = "Sort Project";
        action.description = "Automatically sorts the project assets into folders by type.";
        // Array of strings. It will populate a sub menu in the context menu, creating more actions. If empty, no sub menu will be created.
        action.group = [];
        // This is the function that will be called when the action is clicked.
        action.apply = () => {
            if(this.dialogActive) {
                if(this.dialogWindow == null) {
                    this.dialogActive = false;
                }
                this.dialogWindow.raise();
                this.dialogWindow.activateWindow();
                this.dialogWindow.show();
                return;
            }
            this.dialogActive = true;

            try {
                /**
                * @type {Ui.Gui}
                */
                const guiComponent = this.pluginSystem.findInterface(Ui.IGui.interfaceID);
                const gui = guiComponent;
                const dialog = gui.createDialog();
                this.dialogWindow = dialog;
            
                // Dialog layout
                const dialogSortLayout = Ui.BoxLayout.create();
                dialogSortLayout.setDirection(Ui.Direction.TopToBottom);

                // DIALOG UI

                // Text
                const dialogText = Ui.Label.create(dialog);
                dialogText.text = "This plugin is still in development and crashes may occur. \nMake sure to save the project before using the sort function." 
                dialogText.foregroundRole = Ui.ColorRole.BrightText;

                // Button
                const dialogButton = Ui.PushButton.create(dialog);
                dialogButton.primary = true;
                dialogButton.resize(100, 10)
                dialogButton.text = "Sort Assets";
                dialogButton.enabled = false;
                dialogButton.onClick.connect(() => {
                    this.sortProject(this.pluginSystem);
                    dialog.close();
                    this.dialogActive = true;
                });

                // Checkbox
                const checkBox = Ui.CheckBox.create(dialog);
                checkBox.text = "I have recently saved. Let's get sorted!"
                checkBox.onToggle.connect((checked) => {
                    if (checked) {
                        dialogButton.enabled = true;
                    } else {
                        dialogButton.enabled = false;
                    }
                });

                dialogSortLayout.addWidget(dialogText);
                dialogSortLayout.addWidget(checkBox);
                dialogSortLayout.addWidget(dialogButton);

                //
                //
            
                dialog.windowTitle = "Sort Warning";
                dialog.resize(200, 100);
                dialog.layout = dialogSortLayout;

                dialog.blockSignals(true);
                dialog.raise();
                dialog.activateWindow();
                dialog.show();
            } catch (e) {
                Editor.print(e);
                Editor.print(e.message);
                Editor.print(e.stack);
            }
        };
        return action;
    }

    sortProject(pluginSystem) {
        Editor.print("Sorting assets...");
    
        const model = pluginSystem.findInterface(Editor.Model.IModel);
        const project = model.project;
        const assetManager = project.assetManager;
    
        // ROOT PATH
        const assetDirectory = project.assetsDirectory;
    
        // FINDS & LISTS ALL ASSETS & FOLDERS
        const result = FileSystem.readDir(assetDirectory, {recursive: false})
    
        FileSystem.createDir( (assetDirectory + "/Assets/Scripts"), {recursive: true});
        FileSystem.createDir( (assetDirectory + "/Assets/Textures/Render Targets"), {recursive: true});
        FileSystem.createDir( (assetDirectory + "/Assets/Materials/Shaders"), {recursive: true});
        FileSystem.createDir( (assetDirectory + "/Assets/Meshes"), {recursive: true});
        FileSystem.createDir( (assetDirectory + "/Assets/Sounds"), {recursive: true});
        FileSystem.createDir( (assetDirectory + "/Assets/VFX"), {recursive: true});
        FileSystem.createDir( (assetDirectory + "/Assets/Physics"), {recursive: true});
        FileSystem.createDir( (assetDirectory + "/Assets/Addons"), {recursive: true});
        FileSystem.createDir( (assetDirectory + "/Assets/Others"), {recursive: true});
        FileSystem.createDir( (assetDirectory + "/Assets/Prefabs"), {recursive: true});
        
        // Editor.print(result);
    
        assetManager.assets.forEach((asset) => {
            var assetType = asset.type;
            var fileMeta = asset.fileMeta;

            var extendedFileName = (new Editor.Path(assetDirectory + "/" + fileMeta.sourcePath).fileName).toString();

            // return if package
            if(fileMeta.sourcePath.toString().indexOf("/Cache/") !== -1) {
                return;
            }

            // return if in Folder
            if(fileMeta.sourcePath.toString().indexOf("/") !== -1) {
                return;
            }

            // Editor.print(' ');
            // Editor.print('Asset Type: ' + assetType);
            // Editor.print('Found @: ' + fileMeta.sourcePath);

            // Prefabs
            if (assetType == "ObjectPrefab") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Prefabs"));
                return;
            }
            
            // Physics
            if (assetType == "Matter" || assetType == "WorldSettingsAsset" || assetType == "Filter") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Physics"));
                return;
            }

            // Addons
            if (extendedFileName.indexOf(".lsc") !== -1 || assetType == "NativePackageDescriptor") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Addons"));
                return;
            }

            // VFX
            if (assetType == "VFXAsset" || extendedFileName.indexOf(".vfxgraph") !== -1) {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/VFX"));
                return;
            }

            // Sounds
            if(assetType == "FileAudioTrack") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Sounds"));
                return;
            }

            // Scripts
            if(assetType == "JavaScriptAsset" || assetType == "TypeScriptAsset" || assetType == "ScriptGraphAsset") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Scripts"));
                return;
            }

            // Scenes
            if(assetType == "Scene") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets"));
                return;
            }

            // Meshes
            if(assetType == "FileMesh") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Meshes"));
                return;
            }

            // Materials
            if(assetType == "Material") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Materials"));
                return;
            }

            // Shaders
            if(assetType == "ShaderGraphPass") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Materials/Shaders"));
                return;
            }

            // Textures
            if(assetType == "FileTexture" || assetType.toString().indexOf("Texture") !== -1) {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Textures"));
                return;
            }

            // Render Targets & Device Texture
            if(assetType == "RenderTarget" || assetType == "DeviceCameraTexture") {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Textures/Render Targets"));
                return;
                /*FileSystem.copyDir((assetDirectory + "/" + fileMeta.sourcePath), (assetDirectory + "/Assets"), {force: false, recursive: true})
    
                var references = asset.getDirectlyReferencedEntities();
                var owned = asset.getOwnedEntities();
                FileSystem.copyFile((assetDirectory + "/" + fileMeta.sourcePath), (assetDirectory + "/Assets/" + extendedFileName));

                Editor.print(assetManager.findImportedCopy((assetDirectory + "/Assets/" + extendedFileName)).primaryAsset);
                if(assetManager.findImportedCopy((assetDirectory + "/Assets/" + extendedFileName)).primaryAsset != null) {
                    this.replaceReferences([asset], assetManager.findImportedCopy((assetDirectory + "/Assets/" + extendedFileName)).primaryAsset)
                }
    
                FileSystem.remove((assetDirectory + "/" + fileMeta.sourcePath));*/
            }

            // Modules
            if(assetType.toString().indexOf("Module") !== -1) {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Scripts/Modules"));
                return;
            }

            // Tracking Assets
            if(assetType == "SnapcodeMarker" || assetType == "ImageMarker" || assetType == "Location" || assetType.toString().indexOf("Track") !== -1) {
                if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
                assetManager.move(fileMeta, new Editor.Path("Assets/Others/Tracking Assets"));
                return;
            }

            if(!FileSystem.isFile(assetDirectory + "/" + fileMeta.sourcePath)) return;
            assetManager.move(fileMeta, new Editor.Path("Assets/Others"));
        });

        Editor.print("Assets sorted!");
        Editor.print('Click the gear next to the Asset Browser search & select "Start Rescan" to show the full directory.');
    }

    // Start function in CoreService is called when Lens Studio starts and the plugin is loaded.
    start() {
        // Get the action registry component through the component ID.
        const actionsRegistry = this.pluginSystem.findInterface(Editor.IContextActionRegistry.interfaceID);
        // We need to hold the references to the actions to prevent them from being garbage collected.
        this.guard = [];
        this.guard.push(actionsRegistry.registerAction((context) => this.createAssetAction(context)));
    }

    stop() {
        // Clear the guard array to allow the actions to be garbage collected.
        this.guard = [];
    }
}
import { MenuItem } from '../components/MenuBar';
import {ContextItem} from '../components/ContextMenu';

import { rxConfig, setRxConfig } from './rxConfig';

const { ipcRenderer, shell, remote, webFrame } = require('electron');
const {dialog, BrowserWindow, app} = remote;

var win = remote.getCurrentWindow();
var themeType = 'dark'
var config = {};

ipcRenderer.on('change-theme', function(event, args) { 
    themeType = args[0] as string
});

rxConfig.subscribe(Config => {
    config = Config;   
});


class MenuItems {

    isDark = () : Boolean => {
        if (themeType == 'dark') {
            return true;
        } else {
            return false;
        }
    }
    
    isLight = () : Boolean => {
        if (themeType == 'light') {
            return true;
        } else {
            return false;
        }
    }
    
    win = () : Array<MenuItem> => { 
        return [
            {
                title: "File",
                contextMenu: [
                    {
                        role: 'normal',
                        title: 'Exit',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().close();
                        }
                    }
                ] as Array<ContextItem>
            },
            {
                title: 'Edit',
                contextMenu: [
                    {
                        role: 'normal',
                        title: 'Cut',
                        shortcut: 'Ctrl+X',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().webContents.cut();
                        }
                    },
                    {
                        role: 'normal',
                        title: 'Copy',
                        shortcut: 'Ctrl+C',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().webContents.copy();
                        }
                    },
                    {
                        role: 'normal',
                        title: 'Paste',
                        shortcut: 'Ctrl+V',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().webContents.paste();
                        }
                    },
                    {
                        role: 'normal',
                        title: 'Delete',
                        shortcut: '',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().webContents.delete();
                        }
                    },
                    {
                        role: 'normal',
                        title: 'Select All',
                        shortcut: 'Ctrl+A',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().webContents.selectAll();
                        }
                    }
                ] as Array<ContextItem>
            },
            {
                title: 'View',
                contextMenu: [
                    {
                        role: 'normal',
                        title: 'Reload',
                        shortcut: 'Ctrl+R',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().reload();
                        }
                    },
                    {
                        role: 'normal',
                        title: 'Force Reload',
                        shortcut: 'Ctrl+Shift+R',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().webContents.reloadIgnoringCache();
                        }
                    },
                    {
                        role: 'normal',
                        title: 'Toggle Developer Tools',
                        shortcut: 'Ctrl+Shift+I',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().webContents.toggleDevTools()
                        }
                    },
                    {
                        role: 'seperator',
                    },
                    {
                        role: 'submenu',
                        title: 'Appearance',
                        enabled: true,
                        contextMenu: [
                            {
                                role: 'normal',
                                title: 'Dark Theme',
                                enabled: true,
                                selected: this.isDark(),
                                action() { 
                                    ipcRenderer.send('changeAppTheme', ['dark']);
                                }
                            },
                            {
                                role: 'normal',
                                title: 'Light Theme',
                                enabled: true,
                                selected: this.isLight(),
                                action() { 
                                    ipcRenderer.send('changeAppTheme', ['light']);
                                }
                            },
                        ] as Array<ContextItem>
                    },
                    {
                        role: 'seperator',
                    },
                    {
                        role: 'normal',
                        title: 'Actual Size',
                        shortcut: 'Ctrl+0',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().webContents.setZoomFactor(1);
                            
                        }
                    },
                    {
                        role: 'normal',
                        title: 'Zoom In',
                        shortcut: 'Ctrl+Shift+=',
                        enabled: true,
                        action() { 
                            const currentZoomLevel : any = webFrame.getZoomFactor();
                            remote.getCurrentWindow().webContents.setZoomFactor(currentZoomLevel + 0.2);
                        }
                    },
                    {
                        role: 'normal',
                        title: 'Zoom Out',
                        shortcut: 'Ctrl+Shift+-',
                        enabled: true,
                        action() { 
                            const currentZoomLevel : any = webFrame.getZoomFactor();
                            remote.getCurrentWindow().webContents.setZoomFactor(currentZoomLevel - 0.2);
                        }
                    },
                    {
                        role: 'seperator'
                    },
                    {
                        role: 'normal',
                        title: 'Toggle Full Screen',
                        shortcut: 'F11',
                        enabled: true,
                        action() { 
                            remote.getCurrentWindow().setFullScreen(!remote.getCurrentWindow().isFullScreen());
                        }
                    },
                ] as Array<ContextItem>
            },
            {
                title: 'Help',
                contextMenu: [
                    {
                        role: 'normal',
                        title: 'Official CB DLive Channel',
                        shortcut: '',
                        enabled: true,
                        action() { 
                            shell.openExternal("https://dlive.tv/creativebuilds");
                        }
                    },
                    {
                        role: 'normal',
                        title: 'CreativeBuilds Discord',
                        shortcut: '',
                        enabled: true,
                        action() { 
                            shell.openExternal("https://discord.gg/2DGaWDW");
                        }
                    },
                    {
                        role: 'normal',
                        title: 'Github Page',
                        shortcut: '',
                        enabled: true,
                        action() { 
                            shell.openExternal("https://github.com/CreativeBuilds/dlive-chat-bot");
                        }
                    },
                    {
                        role: 'normal',
                        title: 'About App',
                        shortcut: '',
                        enabled: true,
                        action() { 
                            let options = {
                                type: 'info',
                                title: 'About App',
                                message: 'About Dlive Chat Bot',
                                detail: `
                                Version: ${app.getVersion()}, 
                                Electron: ${process.versions.electron}, 
                                chrome: ${process.versions.chrome}, 
                                node: ${process.versions.node}, 
                                v8: ${process.versions.v8}, 
                                Developed By CreativeBuilds`
                            };
        
                            dialog.showMessageBox(options);
                        }
                    },
                ] as Array<ContextItem>
            }
        ] as Array<MenuItem>;
    }
}

const menuItems = new MenuItems();
const menuItems_win = menuItems.win();

export { menuItems_win }
import { app, BrowserWindow, shell } from 'electron';

import * as log from 'electron-log';
import * as settings from 'electron-settings';
import * as path from 'path';

import { CommandLineCommand, ICommandLine, CommandEnum } from './cmd-line/command-line';

import { registerAnonMessages } from './messages/anonymizer-messages';
import { registerResultViewerMessages } from './messages/report-viewer-messages';
import { CliProcess } from './cmd-line/cli-process';

export class Main {
  private static mainWindow: Electron.BrowserWindow | null;
  private static backgroundWindow: Electron.BrowserWindow | null;
  private static resultWindow: Electron.BrowserWindow | null;

  static Start() {

    if (CommandLineCommand.Development) {
      log.transports.file.file = __dirname + '/log.txt';
    }
    log.transports.file.level = CommandLineCommand.LogLevel as log.LevelOption;
    log.transports.console.level = CommandLineCommand.Command === CommandEnum.Cli ? false : CommandLineCommand.LogLevel as log.LevelOption;

    log.debug(CommandLineCommand);

    if (CommandLineCommand.Command === CommandEnum.Cli) {
      CliProcess(CommandLineCommand).then((exitCode) => {
        process.exit(exitCode);
      })
    } else {
      this.startElectron();
    }
  }

  private static startElectron() {

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      this.setSettings();

      log.debug(settings.get("AppSettings"));
      log.debug("Log File:" + log.transports.file.file);

      this.createWindows();
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    /* app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.mainWindow === null) {
        this.createMainWindow();
        this.createBackgroundWindow();
      }
    }); */
  }

  private static createBackgroundWindow(): void {
    const win = new BrowserWindow({
      show: CommandLineCommand.Debug
    });

    win.loadURL(`file://${__dirname}/background/index-background.html`);

    this.backgroundWindow = win;
  }

  private static createMainWindow() {
    // Create the browser window.
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 500,
      useContentSize: true,
      show: false,
      resizable: false,
      fullscreen: false,
      titleBarStyle: 'hidden-inset',
      /*    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),*/
      title: "IMPI"
    });

    this.mainWindow.setMenu(null);

    let url: string;
    if (CommandLineCommand.Development) {
      url = "http://localhost:4200";
    } else {
      url = `file://${__dirname}/anonymizer/index.html`
    }
    this.mainWindow.loadURL(url);

    // Open the DevTools.
    if (CommandLineCommand.Debug) {
      this.mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    this.mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      if (this.backgroundWindow && !this.backgroundWindow.isDestroyed()) {

        this.backgroundWindow.close();
        this.backgroundWindow = null;
      }
      this.mainWindow = null;
    });

    this.mainWindow.on('close', (e: any) => {
      /* if (isProcessing) {
         dialog.showMessageBox(mainWindow, {
           type: "warning",
           title: "Close Window",
           message: "Can't close Window while processing.",
           detail: "Wait until processing is finished.",
           buttons: ["OK"],
           defaultId: 0
         });
         e.preventDefault();
         return;
       }*/
    });



    this.mainWindow.webContents.on('did-finish-load', () => {
      const WEBVIEW_LOAD_TIMEOUT_MS = 100;

      // The flash of white is still present for a very short
      // while after the WebView reports it finished loading
      setTimeout(() => {
        if (this.mainWindow)
          this.mainWindow.show();
      }, WEBVIEW_LOAD_TIMEOUT_MS);

    });

    this.mainWindow.webContents.on('new-window', function (e, url) {
      log.debug("new-window: " + url);
      e.preventDefault();
      let b = shell.openExternal(url);
      log.debug("external open: " + b);
    });
  };

  public static createResultWindow() {
    const win = new BrowserWindow({
      show: false,
      /*parent: mainWindow,
      resizable:true,
      titleBarStyle:'default',
      fullscreenable :true,
      fullscree:true*/
    });

    win.setMenu(null);

    let url: string;
    if (CommandLineCommand.Development) {
      url = "http://localhost:42001";
    } else {
      url = `file://${__dirname}/result-viewer/index.html`
    }
    win.loadURL(url);

    if (CommandLineCommand.Debug) {
      win.webContents.openDevTools();
    }

    this.resultWindow = win;
  }

  private static createWindows() {

    if (CommandLineCommand.Command === CommandEnum.Result) {
      this.createResultWindow();
      log.debug("Register Result-Viewer Messages");
      registerResultViewerMessages(null);
      this.GetResultWindow().show();
    }
    else {
      this.createMainWindow();
      this.createBackgroundWindow();
      log.debug("Register Anonymizer Messages");
      registerAnonMessages();
    }
  }

  public static GetMainWindow(): BrowserWindow {
    if (!Main.mainWindow) throw Error("MainWindow null");
    return Main.mainWindow;
  }

  public static GetBackgroundWindow(): BrowserWindow {
    if (!Main.backgroundWindow) throw Error("BackgroundWindow null");
    return Main.backgroundWindow;
  }

  public static GetResultWindow(): BrowserWindow {
    if (!Main.resultWindow) throw Error("ResultWindow null");
    return Main.resultWindow;
  }

  private static setSettings() {
    if (!settings.has("AppSettings")) {
      settings.set("AppSettings", {
        CSVEncoding: "windows1252",
        CSVFile: path.join(__dirname, "default.csv"),
        CSVSeparater: ";",
        DBFile: path.join(__dirname, "default.db"),
        OutDirectory: __dirname,
        Theme: "Light",
        Language: "en",
        SedexSenderId: "",
        ShowRedFlags: false,
        MappingFile:"mapping.json"
      });
      log.debug("Default AppSettings set");
    }

    if (CommandLineCommand.Command === CommandEnum.Main) {
      if (CommandLineCommand.CSVEncoding.length > 0) {
        settings.set("AppSettings.CSVEncoding", CommandLineCommand.CSVEncoding);
      }
      if (CommandLineCommand.CSVFile.length > 0) {
        settings.set("AppSettings.CSVFile", CommandLineCommand.CSVFile);
      }
      if (CommandLineCommand.CSVSeparator.length > 0) {
        settings.set("AppSettings.CSVSeparater", CommandLineCommand.CSVSeparator);
      }
      if (CommandLineCommand.DBFile.length > 0) {
        settings.set("AppSettings.DBFile", CommandLineCommand.DBFile);
      }
      if (CommandLineCommand.OutputDir.length > 0) {
        settings.set("AppSettings.OutDirectory", CommandLineCommand.OutputDir);
      }
      if (CommandLineCommand.Theme.length > 0) {
        settings.set("AppSettings.Theme", CommandLineCommand.Theme);
      }
      if (CommandLineCommand.Language.length > 0) {
        settings.set("AppSettings.Language", CommandLineCommand.Language);
      }
      if (CommandLineCommand.SedexSenderId.length > 0) {
        settings.set("AppSettings.SedexSenderId", CommandLineCommand.SedexSenderId);
      }
      if (CommandLineCommand.MappingFile.length > 0) {
        settings.set("AppSettings.MappingFile", CommandLineCommand.MappingFile);
      }
    }
  }
}

Main.Start();
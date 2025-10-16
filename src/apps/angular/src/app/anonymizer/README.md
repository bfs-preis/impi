# IMPI Anonymizer Module

## Overview

The Anonymizer module is a complete port of the legacy Angular 5 anonymizer application to Angular 19 with Oblique framework. It provides a web-based interface for processing and anonymizing bank data with geographic enrichment.

## Architecture

### Service Abstraction Layer

The module uses a clean service abstraction pattern that allows seamless switching between mock (web) and real (Electron) implementations:

```
ElectronService (abstract interface)
    ├── ElectronMockService (web implementation)
    └── ElectronRealService (future Electron implementation)
```

### Key Features

- **Web-First Design**: Fully functional in browser without Electron
- **Mock Services**: HTML5 File API and localStorage for web-based operation
- **Observable-Based**: Modern RxJS patterns throughout
- **Type-Safe**: Strongly typed models from original impilib
- **Oblique Styled**: Swiss government design compliance
- **Multi-Language**: Supports de, en, fr, it

## Module Structure

```
anonymizer/
├── components/
│   ├── main/                    # Main orchestrator component
│   ├── db-selector/             # Database file selector
│   ├── csv-selector/            # CSV input file selector
│   ├── output-selector/         # Output directory selector
│   └── shared/
│       └── file-picker/         # Reusable file picker
├── dialogs/
│   ├── settings/                # Settings configuration
│   ├── help/                    # Help information
│   └── kfactor/                 # K-factor validation
├── services/
│   ├── electron.service.ts      # Abstract service interface
│   ├── electron-mock.service.ts # Web-based mock implementation
│   ├── mock-storage.service.ts  # localStorage persistence
│   └── processing.service.ts    # Data processing simulation
├── models/
│   ├── process-option.model.ts  # Processing configuration
│   ├── db-info.model.ts         # Database metadata
│   └── log-result.model.ts      # Processing results
├── anonymizer.module.ts         # Feature module
└── anonymizer-routing.module.ts # Routing configuration
```

## Components

### MainComponent

The orchestrator component that manages the 3-step workflow:

1. **Database Selection** - Validate and load SQLite geodatabase
2. **CSV Input** - Select and validate CSV file with row counting
3. **Output Directory** - Configure output destination
4. **Processing** - Execute data enrichment and anonymization

**Features:**
- Real-time validation state tracking
- Progress monitoring with ETA calculation
- Error handling and notifications
- Settings and help dialogs

### DbSelectorComponent

Handles SQLite database file selection and validation.

**Features:**
- File picker with `.db` filter
- Async validation with loading state
- Display database version and period
- K-factor validation dialog trigger
- Oblique card-based UI

### CsvSelectorComponent

Manages CSV input file selection and validation.

**Features:**
- File picker with `.csv` filter
- Row counting with configurable delimiter
- Async validation
- Formatted row count display

### OutputSelectorComponent

Handles output directory selection.

**Features:**
- Directory picker (simulated in web mode)
- Path validation
- Truncated path display for long paths

### FilePickerComponent (Shared)

Reusable file/directory picker component.

**Props:**
- `label` - Display label
- `buttonText` - Button text
- `filters` - File type filters
- `mode` - 'file' or 'directory'
- `disabled` - Disable state

## Services

### ElectronService (Abstract)

Defines the contract for Electron functionality:

```typescript
abstract class ElectronService {
  abstract getTheme(): Observable<string>;
  abstract setTheme(theme: string): void;
  abstract getLanguage(): Observable<string>;
  abstract setLanguage(lang: string): void;
  abstract getAppVersion(): string;
  abstract getSetting<T>(key: string, defaultValue?: T): T;
  abstract setSetting<T>(key: string, value: T): void;
  abstract selectFile(filters: FileFilter[]): Observable<string | null>;
  abstract selectDirectory(): Observable<string | null>;
  abstract verifyDatabase(file: string): Observable<IDbInfo>;
  abstract verifyCsv(file: string, delimiter: string): Observable<number>;
  abstract verifyPath(path: string): Observable<boolean>;
  abstract checkKFactor(file: string): Observable<boolean>;
  abstract log(level: 'info' | 'warn' | 'error', message: string): void;
}
```

### ElectronMockService

Web-based implementation using:
- **HTML5 File API** for file selection
- **localStorage** for settings persistence
- **BehaviorSubject** for reactive state
- **Simulated delays** for realistic UX

**Mock Behaviors:**
- File selection opens native file dialog
- Directory selection uses prompt (fallback)
- Database validation returns mock metadata
- CSV validation counts lines from file content
- All operations return Observables

### MockStorageService

Handles persistence and file reference storage:
- **File References**: In-memory Map for File objects
- **Settings**: localStorage with namespaced keys
- **Async File Reading**: Promise-based file content access

### ProcessingService

Simulates data processing with progress tracking:
- Interval-based progress updates (100ms)
- Row-by-row processing simulation
- Observable stream of progress events
- Configurable processing speed based on row count

## Dialogs

### SettingsDialogComponent

Configuration dialog for:
- CSV encoding (utf8, windows1252, iso88591, macintosh)
- CSV separator (;, ,, \t, |)
- Theme (Light, Dark)
- Language (de, en, fr, it)
- Sedex Sender ID

**Persistence**: All settings saved to localStorage via ElectronService

### HelpDialogComponent

Information dialog displaying:
- Documentation links
- Source code links
- Developer information
- Application version

### KfactorDialogComponent

K-factor validation dialog:
- Start validation button
- Loading state with spinner
- Success/failure result display
- Async validation via ElectronService

## Models

### IProcessOption

Processing configuration interface:
```typescript
interface IProcessOption {
  DbVersion: string;
  DbPeriodFrom: number;
  DbPeriodTo: number;
  CsvRowCount: number;
  CsvEncoding: string;
  CsvSeparator: string;
  DatabaseFile: string;
  InputCsvFile: string;
  OutputPath: string;
  SedexSenderId: string;
  MappingFile: string;
  ClientVersion: string;
}
```

### IDbInfo

Database metadata:
```typescript
interface IDbInfo {
  Version: string;
  PeriodFrom: number;
  PeriodTo: number;
}
```

### ProcessProgress

Real-time processing progress:
```typescript
interface ProcessProgress {
  processedRow: number;
  maxRows: number;
  percentage: number;
}
```

## Styling

### Oblique Integration

The module uses:
- **ObButtonModule** - Button directives
- **ObIconModule** - Icon components
- **ObSpinnerModule** - Loading spinners
- **ObAlertModule** - Alert messages
- **Bootstrap classes** - Cards, badges, alerts
- **Custom SCSS** - Component-specific styling

### Theme Support

- Light theme (default)
- Dark theme (planned)
- Theme switching via settings
- Oblique theme classes applied to body

## Internationalization

### Translation Structure

All translations namespaced under `anonymizer`:

```json
{
  "anonymizer": {
    "Main": { ... },
    "Db": { ... },
    "Csv": { ... },
    "Out": { ... },
    "Settings": { ... },
    "Help": { ... },
    "KFactor": { ... }
  }
}
```

### Supported Languages

- **de** (German) - Default
- **en** (English)
- **fr** (French)
- **it** (Italian)

### Usage

```typescript
{{ 'anonymizer.Main.Title' | translate }}
```

## Routing

### Module Routes

```typescript
const routes: Routes = [
  {
    path: '',
    component: MainComponent
  }
];
```

### Lazy Loading

```typescript
// app-routing.module.ts
{
  path: 'anonymizer',
  loadChildren: () => import('./anonymizer/anonymizer.module')
    .then(m => m.AnonymizerModule)
}
```

### Access

Navigate to `/anonymizer` or use link: `<a routerLink="/anonymizer">Anonymizer</a>`

## Usage

### Basic Workflow

1. **Navigate** to `/anonymizer`
2. **Select database** file (.db)
3. **Select CSV** file (.csv)
4. **Select output** directory
5. **Configure settings** (optional)
6. **Click "Start Processing"**
7. **Monitor progress** with real-time updates
8. **View results** or handle errors

### Settings Configuration

1. Click settings icon (gear)
2. Configure:
   - CSV encoding
   - CSV separator
   - Theme preference
   - Language
   - Sedex Sender ID
3. Click "Save & Close"

### K-Factor Validation

1. Select database file
2. Click "Factor K testing"
3. Click "Start" in dialog
4. View validation result

## Testing

### Mock Service Testing

```typescript
describe('ElectronMockService', () => {
  it('should store and retrieve settings', () => {
    service.setSetting('test', 'value');
    expect(service.getSetting('test')).toBe('value');
  });

  it('should verify database', (done) => {
    service.verifyDatabase('/mock/test.db').subscribe(info => {
      expect(info.Version).toBeDefined();
      done();
    });
  });
});
```

### Component Testing

```typescript
describe('MainComponent', () => {
  it('should enable process button when all valid', () => {
    component.setState(0, true);
    component.setState(1, true);
    component.setState(2, true);
    expect(component.allValid()).toBe(true);
  });
});
```

## Future Enhancements

### Planned Features

1. **Real Electron Service** - Implement `ElectronRealService` for desktop app
2. **Worker Threads** - Offload CSV processing to web workers
3. **IndexedDB** - Store larger files in browser
4. **PWA Support** - Offline capability and installability
5. **Advanced Validation** - Real CSV parsing and validation
6. **Progress Persistence** - Resume interrupted processing
7. **Batch Processing** - Process multiple files
8. **Export Formats** - Additional output formats

### Migration to Electron

To enable Electron functionality:

1. Implement `ElectronRealService`
2. Set `environment.electron = true`
3. Update provider in module:
```typescript
{
  provide: ElectronService,
  useClass: environment.electron
    ? ElectronRealService
    : ElectronMockService
}
```

## Limitations

### Mock Service Constraints

1. **File Paths**: No real file system paths (uses mock paths like `/mock/filename.ext`)
2. **Directory Selection**: Uses prompt() fallback
3. **Database Validation**: Returns mock data only
4. **CSV Parsing**: Simple line counting, no actual parsing
5. **Processing**: Simulated only, no real data transformation
6. **Settings Storage**: localStorage only (not electron-settings)

### Browser Limitations

1. **File Access**: Limited to user-selected files via File API
2. **Notifications**: Requires user permission
3. **Background Processing**: Simulated with intervals
4. **Large Files**: Memory constraints for very large CSVs

## Dependencies

### Required

- `@angular/core`: ^19.2.0
- `@angular/material`: ^19.2.19
- `@oblique/oblique`: ^13.3.3
- `@ngx-translate/core`: ^16.0.0
- `moment`: ^2.x.x
- `rxjs`: ~7.8.0

### Development

- TypeScript: ~5.7.2
- Angular CLI: ^19.2.17

## License

MIT

## Credits

**Original Application**: IMPI Anonymizer (Angular 5)
**Ported By**: Claude Code
**Framework**: Oblique (Swiss Federal Administration)
**Target Platform**: Angular 19 + Oblique 13

---

For questions or issues, please refer to the main IMPI documentation or the Oblique documentation at https://oblique.bit.admin.ch

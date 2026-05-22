# SensoSCAN Coordinate File Generator

Small local browser app for generating grid coordinate files for SensoSCAN / SensoFar MMR measurements.

## Coordinate Format

The app exports the SensoSCAN manual-style coordinate file:

```text
[References]
[Measures]
-86.0000 41.0000 -29.1254
-54.3000 41.0000 -29.1254
...
```

The default grid is 5 rows by 6 columns, starting from `-86.0000 41.0000 -29.1254`.
The generator still lets you calculate positions as an absolute grid from the first point, or as a relative centered grid, but the exported file sections follow the manual: `[References]` and `[Measures]`.

## Run

From this folder:

```powershell
.\update-and-run.cmd
```

Then open:

```text
http://127.0.0.1:4183
```

## One-Click Install on Another Windows Computer

Download and double-click:

```text
install-update-and-run.cmd
```

It clones or updates:

```text
%USERPROFILE%\coordinates-file-generator
```

and starts the local browser app.

# SensoSCAN Coordinate File Generator

Small local browser app for generating grid coordinate files for SensoSCAN / SensoFar MMR measurements.

## Coordinate Format

The app can export the SensoSCAN-style relative coordinate file:

```text
[Measures Relative]
# X_mm Y_mm Z_mm
# Relative positions are added to the current stage position when MMR acquisition starts.
-79.2500 -79.2500 -24.1000
-47.5500 -79.2500 -24.1000
...
```

It can also export an absolute grid starting from a first measured stage coordinate, for example:

```text
[Measures Absolute]
# X_mm Y_mm Z_mm
-77.0000 37.0000 -24.1000
-45.3000 37.0000 -24.1000
...
```

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

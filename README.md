# hyprland-community.github.io
Hyprland community website written in pure js and lit [maintainer=@yavko]

## Stack
Pure Javascript, and importmaps for dependency management and Lit for the ui, which
is all templated using a custom build shell script template engine.

## Building
This project uses a custom made template engine written in shell script (only tested in ZSH),
it can be invoked using the `build.sh` script, the template itself is in `template.sh`, and the 
engine itself is in `builder/templater.sh`, in the future more templaters can be added.

To automagically rebuild when changes are made use the `dev.sh` script, though it will only rebuild and not serve!

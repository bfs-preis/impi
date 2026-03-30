{
  description = "IMPI development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js 22.x (matches .node-version / .nvmrc: 22.19.0)
            nodejs_22
            pnpm

            # Electron native module build dependencies
            python3
            pkg-config
            gcc
            gnumake

            # Electron runtime dependencies
            electron

            # Common native module dependencies
            openssl
            zlib

            # GitHub CLI
            gh
          ];

          shellHook = ''
            echo "IMPI dev environment loaded"
            echo "  Node.js: $(node --version)"
            echo "  pnpm:    $(pnpm --version)"
          '';
        };
      });
}

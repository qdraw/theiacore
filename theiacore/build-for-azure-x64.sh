#!/bin/bash
pushd theiacore
dotnet publish -c release -r win-x64
popd

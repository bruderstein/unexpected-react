#!/bin/sh

cp $1/unexpected-react.js .
cp $1/unexpected-react-test-renderer.js .
yarn add unexpected-react@latest


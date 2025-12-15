#!/bin/bash

# Run this command from previous directory: ./patches/apply_patch.sh

for i in  `ls patches/*.patch`
do
	patch -f -p0 < $i || true
done

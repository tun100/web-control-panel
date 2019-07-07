import fs from 'fs';
import path from 'path';
import os from 'os';
import process from 'process';
var _ = require('lodash');
var sh = require('shelljs');
var gutils = require('global-code-utils');

function getCwdDir(targetPath) {
	return path.join(process.cwd(), targetPath);
}
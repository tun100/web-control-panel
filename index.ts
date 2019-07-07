import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as process from 'process';
var _ = require('lodash');
var sh = require('shelljs');
var gutils = require('global-code-utils');

function getCwdDir(targetPath) {
	return path.join(process.cwd(), targetPath);
}
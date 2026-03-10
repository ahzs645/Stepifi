// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import { exec } from "node:child_process";

export function execAsync(command) {
    return new Promise((resolve, reject) => {
        console.log(`> ${command}`);
        const child = exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                reject(error);
            } else {
                if (stdout) console.log(stdout);
                resolve(stdout);
            }
        });
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);
    });
}

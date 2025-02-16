/**
 * @license
 * Copyright 2016-2020 Balena Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { flags } from '@oclif/command';
import Command from '../command';
import * as cf from '../utils/common-flags';
import { getBalenaSdk, stripIndent } from '../utils/lazy';
import { applicationIdInfo } from '../utils/messages';
import { parseAsLocalHostnameOrIp } from '../utils/validation';
import { isV13 } from '../utils/version';

interface FlagsDef {
	application?: string;
	fleet?: string;
	pollInterval?: number;
	help?: void;
}

interface ArgsDef {
	deviceIpOrHostname?: string;
}

export default class JoinCmd extends Command {
	public static description = stripIndent`
		Move a local device to a fleet on another balena server.

		Move a local device to a fleet on another balena server, causing
		the device to "join" the new server. The device must be running balenaOS.

		For example, you could provision a device against an openBalena installation
		where you perform end-to-end tests and then move it to balenaCloud when it's
		ready for production.

		To move a device between fleets on the same server, use the
		\`balena device move\` command instead of \`balena join\`.

		If you don't specify a device hostname or IP, this command will automatically
		scan the local network for balenaOS devices and prompt you to select one
		from an interactive picker. This may require administrator/root privileges.
		Likewise, if the fleet option is not provided then a picker will be shown.

		${applicationIdInfo.split('\n').join('\n\t\t')}
	`;

	public static examples = [
		'$ balena join',
		'$ balena join balena.local',
		'$ balena join balena.local --fleet MyFleet',
		'$ balena join balena.local -f myorg/myfleet',
		'$ balena join 192.168.1.25',
		'$ balena join 192.168.1.25 --fleet MyFleet',
	];

	public static args = [
		{
			name: 'deviceIpOrHostname',
			description: 'the IP or hostname of device',
			parse: parseAsLocalHostnameOrIp,
		},
	];

	// Hardcoded to preserve camelcase
	public static usage = 'join [deviceIpOrHostname]';

	public static flags: flags.Input<FlagsDef> = {
		...(isV13() ? {} : { application: cf.application }),
		fleet: cf.fleet,
		pollInterval: flags.integer({
			description: 'the interval in minutes to check for updates',
			char: 'i',
		}),
		help: cf.help,
	};

	public static authenticated = true;
	public static primary = true;

	public async run() {
		const { args: params, flags: options } = this.parse<FlagsDef, ArgsDef>(
			JoinCmd,
		);

		const promote = await import('../utils/promote');
		const sdk = getBalenaSdk();
		const logger = await Command.getLogger();
		return promote.join(
			logger,
			sdk,
			params.deviceIpOrHostname,
			options.application || options.fleet,
			options.pollInterval,
		);
	}
}

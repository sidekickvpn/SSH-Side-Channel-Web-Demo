'use strict';

var netconsole = false;
function vm_tx_callback(data) {
	if (netconsole == false) {
		netconsole = document.getElementById('netconsole');
	}

	var eth_dst_mac = data.slice(0, 6);
	var eth_src_mac = data.slice(6, 12);
	var ether_type = data.slice(12, 14);
	var ether_options = data.slice(14, 20);
	var opcode = data.slice(20, 22);
	var src_mac = data.slice(22, 28);
	var src_ip = data.slice(28, 32);
	var dst_mac = data.slice(32, 38);
	var dst_ip = data.slice(38, 42);
	var frame_remainder = data.slice(42);

	if (ether_type[0] == 0x08 && ether_type[1] == 0x06) {
		//ARP Packet...generate a reply
		var re_src_mac = [12, 34, 56, 65, 43, 21];
		var re_dst_mac = src_mac.slice();
		var re_opcode = [0, 2]; //ARP REPLY
		var re_dst_ip = src_ip.slice();
		var re_src_ip = dst_ip.slice();

		var reply_packet = [];
		for (var i = 0; i < re_dst_mac.length; i++)
			reply_packet.push(re_dst_mac[i]);

		for (var i = 0; i < re_src_mac.length; i++)
			reply_packet.push(re_src_mac[i]);

		for (var i = 0; i < ether_type.length; i++)
			reply_packet.push(ether_type[i]);

		for (var i = 0; i < ether_options.length; i++)
			reply_packet.push(ether_options[i]);

		for (var i = 0; i < re_opcode.length; i++) reply_packet.push(re_opcode[i]);

		for (var i = 0; i < re_src_mac.length; i++)
			reply_packet.push(re_src_mac[i]);

		for (var i = 0; i < re_src_ip.length; i++) reply_packet.push(re_src_ip[i]);

		for (var i = 0; i < re_dst_mac.length; i++)
			reply_packet.push(re_dst_mac[i]);

		for (var i = 0; i < re_dst_ip.length; i++) reply_packet.push(re_dst_ip[i]);

		for (var i = 0; i < frame_remainder.length; i++)
			reply_packet.push(frame_remainder[i]);

		netconsole.value +=
			'[ARP] Setting host ' +
			dst_ip[0] +
			'.' +
			dst_ip[1] +
			'.' +
			dst_ip[2] +
			'.' +
			dst_ip[3] +
			' as 0C:22:38:41:2B:15.\n';

		return reply_packet;
	} else if (ether_type[0] == 0x08 && ether_type[1] == 0x00) {
		//IPv4 packet
		//console.log("IPv4:" + data);
		var ipv4_proto = data[23];
		var ipv4_src = data.slice(26, 30);
		var ipv4_dst = data.slice(30, 34);

		//TCP Protocol
		if (ipv4_proto == 0x06) {
			var tcp_sport = 256 * data[34] + 1 * data[35];
			var tcp_dport = 256 * data[36] + 1 * data[37];
			var payload_size = data.length - 20 - 20 - 26;
			netconsole.value +=
				'[TCP/IPv4] SOURCE: ' +
				ipv4_src[0] +
				'.' +
				ipv4_src[1] +
				'.' +
				ipv4_src[2] +
				'.' +
				ipv4_src[3] +
				':' +
				tcp_sport +
				'  DEST: ' +
				ipv4_dst[0] +
				'.' +
				ipv4_dst[1] +
				'.' +
				ipv4_dst[2] +
				'.' +
				ipv4_dst[3] +
				':' +
				tcp_dport +
				'  LENGTH: ' +
				payload_size +
				'\n';

			//Visualization
			update_chart(payload_size);

			var newpacket = data.slice();
			//SWAP: (MAC SRC) with (MAC DST)
			//Do DST MAC (newpacket[0:6])...
			newpacket[0] = data[6];
			newpacket[1] = data[7];
			newpacket[2] = data[8];
			newpacket[3] = data[9];
			newpacket[4] = data[10];
			newpacket[5] = data[11];

			//Do SRC MAC (newpacket[6:12])...
			newpacket[6] = data[0];
			newpacket[7] = data[1];
			newpacket[8] = data[2];
			newpacket[9] = data[3];
			newpacket[10] = data[4];
			newpacket[11] = data[5];

			//SWAP: (IP SRC) with (IP DST)
			//Do SRC IP (newpacket[26:30])
			newpacket[26] = data[30];
			newpacket[27] = data[31];
			newpacket[28] = data[32];
			newpacket[29] = data[33];

			//Do DST IP (newpacket[30:34])
			newpacket[30] = data[26];
			newpacket[31] = data[27];
			newpacket[32] = data[28];
			newpacket[33] = data[29];

			return newpacket;
		} else {
			netconsole.value +=
				'[IPv4] SOURCE: ' +
				ipv4_src[0] +
				'.' +
				ipv4_src[1] +
				'.' +
				ipv4_src[2] +
				'.' +
				ipv4_src[3] +
				'  DEST: ' +
				ipv4_dst[0] +
				'.' +
				ipv4_dst[1] +
				'.' +
				ipv4_dst[2] +
				'.' +
				ipv4_dst[3] +
				'\n';
		}
	}
	return [];
}

window.onload = function() {
	//Initialize chart
	update_chart(0);

	//Initialize interactive user instructions
	nextUserInstruction();

	var container_client = document.getElementById('screen_client');
	var container_tty = document.getElementById('serial_tty');

	var emulator_client = new V86Starter({
		screen_container: container_client,
		serial_container: container_tty,
		memory_size: 536870912,
		bios: {
			url: 'bios/seabios.bin'
		},
		vga_bios: {
			url: 'bios/vgabios.bin'
		},
		cdrom: {
			url: 'bootable.iso'
		},
		autostart: true,
		network_relay_url: vm_tx_callback
	});

	emulator_client.add_listener('net0-receive', function(netbuffer) {
		console.log('Rx network packet from VM.');
	});

	emulator_client.keyboard_set_status(true);
};

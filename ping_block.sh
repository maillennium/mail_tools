#!/sbin/bash
# prevents traceroute and ping requests
#
/sbin/sysctl -w net.ipv4.icmp_echo_ignore_all = 1
/sbin/sysctl -w net.ipv4.icmp_echo_ignore_broadcasts = 1
#
echo "ECHO OFF"
Those are the sysctl's to do the job. Below are iptables rules I also add:
echo "SETTING IPTABLES"
# Be sure tracerouting doesn't work for the tunnel 
iptables -A INPUT -p icmp -m icmp --icmp-type 0 -j DROP 
iptables -A INPUT -p icmp -m icmp --icmp-type 11 -j DROP 
iptables -A INPUT -p icmp -m icmp --icmp-type 30 -j DROP 
iptables -A OUTPUT -p icmp -m icmp --icmp-type 0 -j DROP 
iptables -A OUTPUT -p icmp -m icmp --icmp-type 11 -j DROP 
iptables -A OUTPUT -p icmp -m icmp --icmp-type 30 -j DROP 
iptables -A OUTPUT -s 0/0 -d 0/0 -p udp -m udp --dport 33434:33600 -j DROP
echo "DONE ping/traceroute BLOCKED make sure you run this on both computers"

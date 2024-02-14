import smtplib
import dns.resolver
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

# Function to get SMTP greeting for a domain
def get_smtp_greeting(domain):
    try:
        print("Processing domain:", domain)
        mx_records = dns.resolver.resolve(domain, 'MX')
        mx_record = str(mx_records[0].exchange)
        with smtplib.SMTP(mx_record, timeout=60) as smtp:
            code, message = smtp.connect(mx_record)
        response = "{}: {} {}".format(domain, code, message.decode())
        print("SMTP Greeting for {}: {} {}".format(domain, code, message.decode()))
    except dns.resolver.NoAnswer:
        response = "{}: Error - No MX record found".format(domain)
        print("No MX record found for", domain)
    except smtplib.SMTPConnectError:
        response = "{}: Error - Failed to connect to SMTP server".format(domain)
        print("Error connecting to SMTP server for", domain)
    except smtplib.SMTPServerDisconnected:
        response = "{}: Error - SMTP server disconnected unexpectedly".format(domain)
        print("SMTP server disconnected unexpectedly for", domain)
    except smtplib.SMTPException as e:
        response = "{}: Error - {}".format(domain, str(e))
        print("SMTP Exception for", domain, ":", str(e))
    except Exception as e:
        response = "{}: Error - {}".format(domain, str(e))
        print("Exception for", domain, ":", str(e))
    
    return response

# Function to read domains from file and process them using a thread pool
def read_domains_and_search(input_file, output_file):
    with open(input_file, 'r') as f:
        domains = f.read().splitlines()

    with open(output_file, 'a') as out_file:
        with ThreadPoolExecutor() as executor:
            results = executor.map(get_smtp_greeting, domains)
            for result in results:
                out_file.write(result + '\n')

# Main function
def main():
    input_file = 'domains.txt'  # File containing list of domains
    output_file = 'smtp_responses.txt'  # File to store domain along with response

    read_domains_and_search(input_file, output_file)
    print("SMTP greetings retrieval completed.")

if __name__ == "__main__":
    main()

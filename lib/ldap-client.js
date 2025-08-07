// Exemplo de cliente LDAP para produção
const ldap = require('ldapjs');

class LDAPClient {
  constructor() {
    this.client = null;
    this.config = {
      url: process.env.LDAP_URL || 'ldap://localhost:389',
      bindDN: process.env.LDAP_BIND_DN || 'admin@domain.com',
      bindPassword: process.env.LDAP_BIND_PASSWORD || 'password',
      baseDN: process.env.LDAP_BASE_DN || 'DC=domain,DC=com'
    };
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.client = ldap.createClient({
        url: this.config.url,
        timeout: 5000,
        connectTimeout: 10000,
      });

      this.client.bind(this.config.bindDN, this.config.bindPassword, (err) => {
        if (err) {
          reject(new Error(`LDAP bind failed: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  async searchUser(searchTerm) {
    return new Promise((resolve, reject) => {
      const filter = `(|(samAccountName=${searchTerm})(displayName=*${searchTerm}*))`;
      const opts = {
        filter: filter,
        scope: 'sub',
        attributes: [
          'samAccountName',
          'displayName',
          'userPrincipalName',
          'userAccountControl',
          'memberOf',
          'department',
          'lastLogon'
        ]
      };

      this.client.search(this.config.baseDN, opts, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        let user = null;

        res.on('searchEntry', (entry) => {
          const attributes = entry.object;
          user = {
            samAccountName: attributes.samAccountName,
            displayName: attributes.displayName,
            userPrincipalName: attributes.userPrincipalName,
            enabled: !(parseInt(attributes.userAccountControl) & 2), // Check if account is disabled
            groups: Array.isArray(attributes.memberOf) ? attributes.memberOf : [attributes.memberOf].filter(Boolean),
            department: attributes.department,
            lastLogon: attributes.lastLogon
          };
        });

        res.on('error', (err) => {
          reject(err);
        });

        res.on('end', () => {
          resolve(user);
        });
      });
    });
  }

  async disableUser(samAccountName) {
    return new Promise((resolve, reject) => {
      const userDN = `CN=${samAccountName},CN=Users,${this.config.baseDN}`;
      
      const change = new ldap.Change({
        operation: 'replace',
        modification: {
          userAccountControl: '514' // 512 (normal) + 2 (disabled) = 514
        }
      });

      this.client.modify(userDN, change, (err) => {
        if (err) {
          reject(new Error(`Failed to disable user: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  async authenticateUser(username, password) {
    return new Promise((resolve, reject) => {
      const userDN = `${username}@${this.config.baseDN.replace('DC=', '').replace(',DC=', '.')}`;
      
      const tempClient = ldap.createClient({
        url: this.config.url,
        timeout: 5000,
      });

      tempClient.bind(userDN, password, (err) => {
        tempClient.unbind();
        
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  disconnect() {
    if (this.client) {
      this.client.unbind();
    }
  }
}

module.exports = LDAPClient;

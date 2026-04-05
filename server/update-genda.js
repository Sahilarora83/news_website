import db from './db.js';

async function updateDb() {
  try {
    const [rows] = await db.query('SELECT id, config_json FROM site_config LIMIT 1');
    if (rows && rows.length > 0) {
      const row = rows[0];
      let config = JSON.parse(row.config_json);
      
      let updated = false;
      if (config.siteNamePrimary === "प्रथम गेंडा") {
        config.siteNamePrimary = "प्रथम एजेंडा";
        updated = true;
      }
      if (config.footerCopyright && config.footerCopyright.includes("प्रथम गेंडा")) {
        config.footerCopyright = config.footerCopyright.replace("प्रथम गेंडा", "प्रथम एजेंडा");
        updated = true;
      }
      
      if (updated) {
        await db.query('UPDATE site_config SET config_json = ? WHERE id = ?', [JSON.stringify(config), row.id]);
        console.log("Database site_config updated successfully!");
      } else {
        console.log("site_config already updated or string not found.");
      }
    } else {
      console.log("No site_config row found.");
    }
    
    // Also update users if needed
    await db.query(`UPDATE users SET email = REPLACE(email, 'prathamgenda', 'prathamagenda')`);
    console.log("Updated users table format.");

    process.exit(0);
  } catch (error) {
    console.error("Error updating DB:", error);
    process.exit(1);
  }
}

updateDb();

package com.example.parent.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigration implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🔄 Running database migration...");
            
            // Check if status column exists
            String checkColumnQuery = """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'parent' AND column_name = 'status'
                """;
            
            var result = jdbcTemplate.queryForList(checkColumnQuery);
            
            if (result.isEmpty()) {
                System.out.println("📝 Adding 'status' column to parent table...");
                
                try {
                    // Step 1: Add the column as nullable first
                    jdbcTemplate.execute("ALTER TABLE parent ADD COLUMN status VARCHAR(50)");
                    System.out.println("✅ Step 1: Added status column (nullable)");
                    
                    // Step 2: Update existing records to have default value
                    jdbcTemplate.execute("UPDATE parent SET status = 'active' WHERE status IS NULL");
                    System.out.println("✅ Step 2: Updated existing records with 'active' status");
                    
                    // Step 3: Make the column NOT NULL
                    jdbcTemplate.execute("ALTER TABLE parent ALTER COLUMN status SET NOT NULL");
                    System.out.println("✅ Step 3: Set status column as NOT NULL");
                    
                    // Step 4: Add default value constraint
                    jdbcTemplate.execute("ALTER TABLE parent ALTER COLUMN status SET DEFAULT 'active'");
                    System.out.println("✅ Step 4: Set default value to 'active'");
                    
                    // Step 5: Add check constraint (optional)
                    try {
                        jdbcTemplate.execute("ALTER TABLE parent ADD CONSTRAINT chk_parent_status CHECK (status IN ('active', 'suspended'))");
                        System.out.println("✅ Step 5: Added check constraint");
                    } catch (Exception e) {
                        System.out.println("⚠️  Step 5: Check constraint might already exist: " + e.getMessage());
                    }
                    
                    System.out.println("🎉 Successfully migrated parent table with 'status' column!");
                    
                } catch (Exception e) {
                    System.err.println("❌ Error during migration: " + e.getMessage());
                    e.printStackTrace();
                    // Don't rethrow, let the application continue
                }
            } else {
                System.out.println("✅ 'status' column already exists in parent table.");
                
                // Check if we need to update any NULL values
                try {
                    int nullCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM parent WHERE status IS NULL", 
                        Integer.class
                    );
                    
                    if (nullCount > 0) {
                        System.out.println("📝 Found " + nullCount + " records with NULL status, updating...");
                        jdbcTemplate.execute("UPDATE parent SET status = 'active' WHERE status IS NULL");
                        System.out.println("✅ Updated NULL status values to 'active'");
                    }
                } catch (Exception e) {
                    System.out.println("⚠️  Could not check for NULL values: " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error during database migration: " + e.getMessage());
            e.printStackTrace();
            // Don't rethrow, let the application continue
        }
    }
}

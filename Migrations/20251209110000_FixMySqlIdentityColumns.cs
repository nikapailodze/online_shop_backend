using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OnlineShopBackend.Migrations
{
    public partial class FixMySqlIdentityColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider.Contains("MySql", StringComparison.OrdinalIgnoreCase))
            {
                // Ensure all PKs are true AUTO_INCREMENT columns for MySQL deployments
                migrationBuilder.Sql("ALTER TABLE `Users` MODIFY COLUMN `Id` INT NOT NULL AUTO_INCREMENT;");
                migrationBuilder.Sql("ALTER TABLE `Products` MODIFY COLUMN `Id` INT NOT NULL AUTO_INCREMENT;");
                migrationBuilder.Sql("ALTER TABLE `CartItems` MODIFY COLUMN `Id` INT NOT NULL AUTO_INCREMENT;");
                migrationBuilder.Sql("ALTER TABLE `Orders` MODIFY COLUMN `Id` INT NOT NULL AUTO_INCREMENT;");
                migrationBuilder.Sql("ALTER TABLE `OrderItems` MODIFY COLUMN `Id` INT NOT NULL AUTO_INCREMENT;");
            }
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider.Contains("MySql", StringComparison.OrdinalIgnoreCase))
            {
                migrationBuilder.Sql("ALTER TABLE `OrderItems` MODIFY COLUMN `Id` INT NOT NULL;");
                migrationBuilder.Sql("ALTER TABLE `Orders` MODIFY COLUMN `Id` INT NOT NULL;");
                migrationBuilder.Sql("ALTER TABLE `CartItems` MODIFY COLUMN `Id` INT NOT NULL;");
                migrationBuilder.Sql("ALTER TABLE `Products` MODIFY COLUMN `Id` INT NOT NULL;");
                migrationBuilder.Sql("ALTER TABLE `Users` MODIFY COLUMN `Id` INT NOT NULL;");
            }
        }
    }
}

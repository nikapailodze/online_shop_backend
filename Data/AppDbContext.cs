using Microsoft.EntityFrameworkCore;
using OnlineShopBackend.Models;

namespace OnlineShopBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "VANTA Coat",
                    Description = "Extreme warmth meets sculptural form. A cocoon of protection, designed for resilience.",
                    Price = 320m,
                    ImageUrl = "/merch1.png",
                    SizesCsv = "S,M,L,XL",
                    ColorsCsv = "black,blue,gray,brown"
                },
                new Product
                {
                    Id = 2,
                    Name = "VANTA Suite",
                    Description = "Fluid structure meets bold tailoring. A statement in modern minimalism.",
                    Price = 220m,
                    ImageUrl = "/merch2.png",
                    SizesCsv = "S,M,L,XL",
                    ColorsCsv = "black,white,brown"
                },
                new Product
                {
                    Id = 3,
                    Name = "VANTA Tee",
                    Description = "Lightweight everyday favorite with breathable fabric for all seasons.",
                    Price = 99.99m,
                    ImageUrl = "/merch3.png",
                    SizesCsv = "XS,S,M,L,XL,XXL",
                    ColorsCsv = "black,gray"
                }
            );
        }
    }
}

using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using OnlineShopBackend.Models;

namespace OnlineShopBackend.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public SmtpEmailService(IOptions<EmailSettings> emailOptions)
        {
            _settings = emailOptions.Value;
        }

        public async Task SendPurchaseNotificationAsync(string purchaserEmail, IEnumerable<CartItem> items, decimal totalPrice)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_settings.SmtpHost) ||
                    string.IsNullOrWhiteSpace(_settings.FromEmail))
                {
                    return;
                }

                using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
                {
                    EnableSsl = _settings.EnableSsl
                };

                if (!string.IsNullOrWhiteSpace(_settings.UserName))
                {
                    client.Credentials = new NetworkCredential(_settings.UserName, _settings.Password);
                }

                var body = BuildBody(purchaserEmail, items, totalPrice);

                var purchaseMessage = new MailMessage
                {
                    From = new MailAddress(_settings.FromEmail),
                    Subject = "Your order confirmation",
                    Body = body,
                    IsBodyHtml = false
                };

                if (!string.IsNullOrWhiteSpace(purchaserEmail))
                {
                    purchaseMessage.To.Add(purchaserEmail);
                    await client.SendMailAsync(purchaseMessage);
                }

                if (!string.IsNullOrWhiteSpace(_settings.NotifyEmail))
                {
                    var notifyMessage = new MailMessage
                    {
                        From = new MailAddress(_settings.FromEmail),
                        Subject = "New purchase received",
                        Body = body,
                        IsBodyHtml = false
                    };

                    notifyMessage.To.Add(_settings.NotifyEmail);
                    await client.SendMailAsync(notifyMessage);
                }
            }
            catch
            {
                // Avoid blocking checkout if email fails; log if logging is added later.
            }
        }

        private static string BuildBody(string purchaserEmail, IEnumerable<CartItem> items, decimal totalPrice)
        {
            var lines = new List<string>
            {
                $"Customer: {purchaserEmail}",
                $"Total: {totalPrice:C}",
                string.Empty,
                "Items:"
            };

            foreach (var item in items)
            {
                lines.Add(
                    $"- {item.Product.Name} x{item.Quantity} @ {item.Product.Price:C} (Color: {item.Color ?? "n/a"}, Size: {item.Size ?? "n/a"})");
            }

            return string.Join(Environment.NewLine, lines);
        }
    }
}

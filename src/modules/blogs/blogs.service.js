const {
  Injectable,
  NotFoundException,
} = require('@nestjs/common');
const { all, get, run } = require('../../shared/database');

function mapBlogRow(row) {
  return {
    id: row.Id,
    title: row.Title,
    excerpt: row.Excerpt,
    category: row.Category,
    author: row.Author,
    readTime: row.ReadTime,
    content: row.Content,
    tags: JSON.parse(row.TagsJson || '[]'),
    status: row.Status,
    featured: Boolean(row.Featured),
    coverImage: row.CoverImage || undefined,
    date: new Date(row.CreatedAtUtc).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    createdAt: Date.parse(row.CreatedAtUtc),
    createdAtUtc: row.CreatedAtUtc,
    updatedAtUtc: row.UpdatedAtUtc,
  };
}

class BlogsService {
  async getPublishedBlogs() {
    const rows = await all(
      'SELECT * FROM "Blogs" WHERE "Status" = ? ORDER BY "CreatedAtUtc" DESC',
      ['published'],
    );
    return rows.map(mapBlogRow);
  }

  async getPublishedBlogById(id) {
    const row = await get(
      'SELECT * FROM "Blogs" WHERE "Id" = ? AND "Status" = ?',
      [id, 'published'],
    );
    if (!row) {
      throw new NotFoundException({ message: 'Blog not found.' });
    }
    return mapBlogRow(row);
  }

  async getAllBlogs() {
    const rows = await all('SELECT * FROM "Blogs" ORDER BY "CreatedAtUtc" DESC');
    return rows.map(mapBlogRow);
  }

  async createBlog(body) {
    const now = new Date().toISOString();
    const id = `${Date.now()}`;

    await run(
      `
        INSERT INTO "Blogs"
          ("Id", "Title", "Excerpt", "Category", "Author", "ReadTime", "Content", "TagsJson", "Status", "Featured", "CoverImage", "CreatedAtUtc", "UpdatedAtUtc")
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        body.title,
        body.excerpt,
        body.category,
        body.author,
        body.readTime,
        body.content,
        JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
        body.status || 'published',
        body.featured ? 1 : 0,
        body.coverImage || null,
        now,
        now,
      ],
    );

    return this.getBlogByIdForAdmin(id);
  }

  async updateBlog(id, body) {
    const existing = await get('SELECT * FROM "Blogs" WHERE "Id" = ?', [id]);
    if (!existing) {
      throw new NotFoundException({ message: 'Blog not found.' });
    }

    const next = {
      title: body.title ?? existing.Title,
      excerpt: body.excerpt ?? existing.Excerpt,
      category: body.category ?? existing.Category,
      author: body.author ?? existing.Author,
      readTime: body.readTime ?? existing.ReadTime,
      content: body.content ?? existing.Content,
      tags: Array.isArray(body.tags) ? body.tags : JSON.parse(existing.TagsJson || '[]'),
      status: body.status ?? existing.Status,
      featured:
        typeof body.featured === 'boolean' ? body.featured : Boolean(existing.Featured),
      coverImage:
        body.coverImage === undefined ? existing.CoverImage : body.coverImage || null,
    };

    await run(
      `
        UPDATE "Blogs"
        SET "Title" = ?, "Excerpt" = ?, "Category" = ?, "Author" = ?, "ReadTime" = ?, "Content" = ?, "TagsJson" = ?, "Status" = ?, "Featured" = ?, "CoverImage" = ?, "UpdatedAtUtc" = ?
        WHERE "Id" = ?
      `,
      [
        next.title,
        next.excerpt,
        next.category,
        next.author,
        next.readTime,
        next.content,
        JSON.stringify(next.tags),
        next.status,
        next.featured ? 1 : 0,
        next.coverImage,
        new Date().toISOString(),
        id,
      ],
    );

    return this.getBlogByIdForAdmin(id);
  }

  async getBlogByIdForAdmin(id) {
    const row = await get('SELECT * FROM "Blogs" WHERE "Id" = ?', [id]);
    if (!row) {
      throw new NotFoundException({ message: 'Blog not found.' });
    }
    return mapBlogRow(row);
  }
}

Injectable()(BlogsService);

module.exports = { BlogsService };

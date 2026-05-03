const {
  BadRequestException,
  Injectable,
  NotFoundException,
} = require('@nestjs/common');
const { all, get, run } = require('../../shared/database');

const VALID_CATEGORIES = new Set([
  'Diabetes',
  'Fracture Risk',
  'Metabolic Syndrome',
  'Osteoporosis',
  'General',
]);

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseFields(fields) {
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new BadRequestException({
      message: 'At least one calculator field is required.',
    });
  }

  const normalized = fields.map((field) => {
    const name = String(field?.name || '').trim();
    const label = String(field?.label || '').trim();
    const unit = String(field?.unit || '').trim();
    const placeholder = String(field?.placeholder || '').trim();
    const defaultValue =
      typeof field?.defaultValue === 'number' && Number.isFinite(field.defaultValue)
        ? field.defaultValue
        : null;

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      throw new BadRequestException({
        message:
          'Field names must start with a letter or underscore and contain only letters, numbers, and underscores.',
      });
    }

    if (!label) {
      throw new BadRequestException({ message: 'Each field must have a label.' });
    }

    return {
      name,
      label,
      unit,
      placeholder,
      defaultValue,
    };
  });

  const names = normalized.map((field) => field.name);
  if (new Set(names).size !== names.length) {
    throw new BadRequestException({
      message: 'Field names must be unique.',
    });
  }

  return normalized;
}

function validateFormula(formula, fields) {
  const normalizedFormula = String(formula || '').trim();
  if (!normalizedFormula) {
    throw new BadRequestException({ message: 'Formula is required.' });
  }

  const allowedChars = /^[0-9A-Za-z_+\-*/().,\s]*$/;
  if (!allowedChars.test(normalizedFormula)) {
    throw new BadRequestException({
      message:
        'Formula contains unsupported characters. Use letters, numbers, spaces, parentheses, commas, and arithmetic operators only.',
    });
  }

  const supportedFunctions = new Set([
    'abs',
    'ceil',
    'floor',
    'max',
    'min',
    'pow',
    'round',
    'sqrt',
  ]);

  const allowedNames = new Set(fields.map((field) => field.name));
  const tokens = normalizedFormula.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  for (const token of tokens) {
    if (
      !allowedNames.has(token) &&
      !supportedFunctions.has(token)
    ) {
      throw new BadRequestException({
        message: `Formula token "${token}" is not a valid field or supported function.`,
      });
    }
  }

  return normalizedFormula;
}

function mapCalculatorRow(row) {
  return {
    id: row.Id,
    slug: row.Slug,
    title: row.Title,
    short: row.ShortDescription,
    category: row.Category,
    description: row.Description || '',
    fields: JSON.parse(row.FieldsJson || '[]'),
    formula: row.Formula,
    resultLabel: row.ResultLabel,
    status: row.Status,
    createdAtUtc: row.CreatedAtUtc,
    updatedAtUtc: row.UpdatedAtUtc,
    isCustom: true,
  };
}

class CalculatorsService {
  async getPublishedCalculators() {
    const rows = await all(
      'SELECT * FROM "Calculators" WHERE "Status" = ? ORDER BY "CreatedAtUtc" DESC',
      ['published'],
    );
    return rows.map(mapCalculatorRow);
  }

  async getAllCalculators() {
    const rows = await all(
      'SELECT * FROM "Calculators" ORDER BY "CreatedAtUtc" DESC',
    );
    return rows.map(mapCalculatorRow);
  }

  async getPublishedCalculatorBySlug(slug) {
    const row = await get(
      'SELECT * FROM "Calculators" WHERE "Slug" = ? AND "Status" = ?',
      [slug, 'published'],
    );
    if (!row) {
      throw new NotFoundException({ message: 'Calculator not found.' });
    }
    return mapCalculatorRow(row);
  }

  async createCalculator(body) {
    const title = String(body.title || '').trim();
    const short = String(body.short || '').trim();
    const category = String(body.category || '').trim() || 'General';
    const description = String(body.description || '').trim();
    const resultLabel =
      String(body.resultLabel || '').trim() || 'Result';
    const status = String(body.status || 'published').trim() || 'published';
    const fields = parseFields(body.fields);
    const formula = validateFormula(body.formula, fields);
    const slug = normalizeSlug(body.slug || title);

    if (!title) {
      throw new BadRequestException({ message: 'Title is required.' });
    }

    if (!short) {
      throw new BadRequestException({ message: 'Short description is required.' });
    }

    if (!slug) {
      throw new BadRequestException({ message: 'Slug is required.' });
    }

    if (!VALID_CATEGORIES.has(category)) {
      throw new BadRequestException({
        message: 'Category is invalid.',
      });
    }

    if (!['draft', 'published'].includes(status)) {
      throw new BadRequestException({
        message: 'Status must be either draft or published.',
      });
    }

    const existing = await get('SELECT "Id" FROM "Calculators" WHERE "Slug" = ?', [
      slug,
    ]);
    if (existing) {
      throw new BadRequestException({
        message: 'A calculator with this slug already exists.',
      });
    }

    const now = new Date().toISOString();

    const result = await run(
      `
        INSERT INTO "Calculators"
          ("Slug", "Title", "ShortDescription", "Category", "Description", "FieldsJson", "Formula", "ResultLabel", "Status", "CreatedAtUtc", "UpdatedAtUtc")
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        slug,
        title,
        short,
        category,
        description || null,
        JSON.stringify(fields),
        formula,
        resultLabel,
        status,
        now,
        now,
      ],
    );

    return this.getCalculatorById(result.lastID);
  }

  async getCalculatorById(id) {
    const row = await get('SELECT * FROM "Calculators" WHERE "Id" = ?', [id]);
    if (!row) {
      throw new NotFoundException({ message: 'Calculator not found.' });
    }
    return mapCalculatorRow(row);
  }
}

Injectable()(CalculatorsService);

module.exports = { CalculatorsService };

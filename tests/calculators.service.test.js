const test = require('node:test');
const assert = require('node:assert/strict');
const { BadRequestException } = require('@nestjs/common');
const { withMocks } = require('./test-helpers');

test('CalculatorsService createCalculator normalizes slug and stores select/boolean fields', async () => {
  const inserts = [];

  const scoped = withMocks('../src/modules/calculators/calculators.service', {
    '../../shared/database': {
      all: async () => [],
      get: async (sql, params) => {
        if (sql.includes('WHERE "Slug" = ?') && params?.[0] === 'metabolic-score') {
          return null;
        }

        if (sql.includes('WHERE "Id" = ?') && params?.[0] === 9) {
          return {
            Id: 9,
            Slug: 'metabolic-score',
            Title: 'Metabolic Score',
            ShortDescription: 'Quick risk score',
            Category: 'General',
            Description: 'desc',
            FieldsJson: JSON.stringify([
              { name: 'age', label: 'Age', type: 'number', unit: '', placeholder: '', defaultValue: null, options: [] },
              {
                name: 'sex',
                label: 'Sex',
                type: 'select',
                unit: '',
                placeholder: '',
                defaultValue: null,
                options: [
                  { label: 'Male', value: 1 },
                  { label: 'Female', value: 0 },
                ],
              },
              { name: 'smoker', label: 'Smoker', type: 'boolean', unit: '', placeholder: '', defaultValue: null, options: [] },
            ]),
            Formula: 'age + sex + smoker',
            ResultLabel: 'Score',
            Status: 'published',
            CreatedAtUtc: '2026-01-01T00:00:00.000Z',
            UpdatedAtUtc: '2026-01-01T00:00:00.000Z',
          };
        }

        return null;
      },
      run: async (_sql, params) => {
        inserts.push(params);
        return { lastID: 9, changes: 1 };
      },
    },
  });

  try {
    const { CalculatorsService } = scoped.loaded;
    const service = new CalculatorsService();

    const result = await service.createCalculator({
      title: 'Metabolic Score',
      short: 'Quick risk score',
      slug: 'Metabolic Score',
      category: 'General',
      description: 'desc',
      resultLabel: 'Score',
      status: 'published',
      formula: 'age + sex + smoker',
      fields: [
        { name: 'age', label: 'Age', type: 'number' },
        {
          name: 'sex',
          label: 'Sex',
          type: 'select',
          options: [
            { label: 'Male', value: 1 },
            { label: 'Female', value: 0 },
          ],
        },
        { name: 'smoker', label: 'Smoker', type: 'boolean' },
      ],
    });

    assert.equal(inserts.length, 1);
    assert.equal(inserts[0][0], 'metabolic-score');
    assert.equal(result.slug, 'metabolic-score');
    assert.equal(result.fields[1].type, 'select');
    assert.equal(result.fields[2].type, 'boolean');
  } finally {
    scoped.restore();
  }
});

test('CalculatorsService rejects formulas with unknown tokens', async () => {
  const scoped = withMocks('../src/modules/calculators/calculators.service', {
    '../../shared/database': {
      all: async () => [],
      get: async () => null,
      run: async () => ({ lastID: 1, changes: 1 }),
    },
  });

  try {
    const { CalculatorsService } = scoped.loaded;
    const service = new CalculatorsService();

    await assert.rejects(
      () =>
        service.createCalculator({
          title: 'Broken',
          short: 'Bad formula',
          slug: 'broken',
          category: 'General',
          resultLabel: 'Score',
          status: 'published',
          formula: 'age + unsupported',
          fields: [{ name: 'age', label: 'Age', type: 'number' }],
        }),
      BadRequestException
    );
  } finally {
    scoped.restore();
  }
});

import React from "react";
import "./ProductOptionsEditor.css";

const PRESET_GROUPS = [
  {
    name: "الحجم",
    choices: [
      { name: "صغير", price: 0 },
      { name: "وسط", price: 10 },
      { name: "عائلي", price: 25 },
    ],
    required: false,
  },
  {
    name: "الطعم",
    choices: [
      { name: "جبنة", price: 0 },
      { name: "شطة وليمون", price: 0 },
      { name: "كباب", price: 0 },
    ],
    required: true,
  },
  {
    name: "النوع",
    choices: [
      { name: "عادي", price: 0 },
      { name: "حار", price: 0 },
    ],
    required: false,
  },
  {
    name: "إضافات",
    choices: [
      { name: "بدون إضافات", price: 0 },
      { name: "جبنة إضافية", price: 5 },
      { name: "صوص إضافي", price: 5 },
    ],
    required: false,
  },
];

export default function ProductOptionsEditor({
  enabled,
  onToggleEnabled,
  options = [],
  onChange,
}) {
  const handleAddGroup = (preset = null) => {
    const newGroup = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: preset ? preset.name : "",
      required: preset ? Boolean(preset.required) : false,
      choices: preset
        ? preset.choices.map((c) =>
            typeof c === "object" && c !== null
              ? { name: c.name || "", price: Number(c.price) || 0 }
              : { name: String(c || ""), price: 0 }
          )
        : [{ name: "", price: 0 }],
    };
    onChange([...options, newGroup]);
  };

  const handleRemoveGroup = (groupIndex) => {
    const updated = options.filter((_, idx) => idx !== groupIndex);
    onChange(updated);
  };

  const handleGroupNameChange = (groupIndex, newName) => {
    const updated = options.map((grp, idx) =>
      idx === groupIndex ? { ...grp, name: newName } : grp
    );
    onChange(updated);
  };

  const handleGroupRequiredChange = (groupIndex, isRequired) => {
    const updated = options.map((grp, idx) =>
      idx === groupIndex ? { ...grp, required: isRequired } : grp
    );
    onChange(updated);
  };

  const handleAddChoice = (groupIndex) => {
    const updated = options.map((grp, idx) => {
      if (idx !== groupIndex) return grp;
      const currentChoices = grp.choices || [];
      return {
        ...grp,
        choices: [...currentChoices, { name: "", price: 0 }],
      };
    });
    onChange(updated);
  };

  const handleRemoveChoice = (groupIndex, choiceIndex) => {
    const updated = options.map((grp, idx) => {
      if (idx !== groupIndex) return grp;
      const filtered = (grp.choices || []).filter((_, cIdx) => cIdx !== choiceIndex);
      return {
        ...grp,
        choices: filtered.length > 0 ? filtered : [{ name: "", price: 0 }],
      };
    });
    onChange(updated);
  };

  const handleChoiceFieldChange = (groupIndex, choiceIndex, field, value) => {
    const updated = options.map((grp, idx) => {
      if (idx !== groupIndex) return grp;
      const newChoices = (grp.choices || []).map((c, cIdx) => {
        if (cIdx !== choiceIndex) return c;
        const currentObj =
          typeof c === "object" && c !== null
            ? { ...c }
            : { name: String(c || ""), price: 0 };

        if (field === "price") {
          return {
            ...currentObj,
            price: value === "" ? "" : Math.max(0, Number(value)),
          };
        }

        return {
          ...currentObj,
          name: value,
        };
      });
      return { ...grp, choices: newChoices };
    });
    onChange(updated);
  };

  return (
    <div className="product-options-editor" dir="rtl">
      {/* 🔘 Main Toggle */}
      <div className="poe-toggle-bar">
        <label className="poe-toggle-label">
          <input
            type="checkbox"
            className="poe-toggle-checkbox"
            checked={enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
          />
          <span className="poe-toggle-custom" />
          <div className="poe-toggle-text">
            <strong>⚙️ خيارات المنتج (الأحجام، الأطعمة، الإضافات...)</strong>
            <span className="poe-toggle-sub">
              فعّل هذا الخيار إذا كان المنتج يتوفر بعدة خيارات أو أحجام، مع إمكانية تحديد زيادة على السعر لكل خيار
            </span>
          </div>
        </label>
      </div>

      {enabled && (
        <div className="poe-body">
          {/* Quick Preset Buttons */}
          <div className="poe-presets-row">
            <span className="poe-presets-title">نماذج سريعة:</span>
            {PRESET_GROUPS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="poe-preset-btn"
                onClick={() => handleAddGroup(preset)}
              >
                + إضافة "{preset.name}"
              </button>
            ))}
          </div>

          {/* List of Option Groups */}
          {options.length === 0 ? (
            <div className="poe-empty-state">
              <p>لم تقم بإضافة أي مجموعة خيارات بعد.</p>
              <button
                type="button"
                className="poe-add-group-btn"
                onClick={() => handleAddGroup()}
              >
                ➕ إضافة أول مجموعة خيارات
              </button>
            </div>
          ) : (
            <div className="poe-groups-list">
              {options.map((group, gIdx) => (
                <div className="poe-group-card" key={group.id || gIdx}>
                  <div className="poe-group-header">
                    <span className="poe-group-badge">
                      المجموعة #{gIdx + 1}: {group.name || "بدون اسم"}
                    </span>
                    <button
                      type="button"
                      className="poe-delete-group-btn"
                      onClick={() => handleRemoveGroup(gIdx)}
                      title="حذف هذه المجموعة"
                    >
                      🗑️ حذف المجموعة
                    </button>
                  </div>

                  {/* Group Name & Required Setting */}
                  <div className="poe-group-inputs">
                    <div className="poe-input-field">
                      <label className="poe-field-label">
                        🏷️ اسم مجموعة الخيارات (مثال: الحجم أو الطعم):
                      </label>
                      <input
                        type="text"
                        className="poe-group-name-input"
                        placeholder="اكتب اسم المجموعة هنا (مثال: الحجم أو الطعم)"
                        value={group.name || ""}
                        onChange={(e) => handleGroupNameChange(gIdx, e.target.value)}
                        required={enabled}
                      />
                    </div>

                    <label className="poe-required-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(group.required)}
                        onChange={(e) =>
                          handleGroupRequiredChange(gIdx, e.target.checked)
                        }
                      />
                      <span>الاختيار إجباري على العميل قبل الإضافة للسلة</span>
                    </label>
                  </div>

                  {/* Choices Section */}
                  <div className="poe-choices-section">
                    <div className="poe-choices-header">
                      <label className="poe-choices-label">
                        الخيارات وزيادة السعر:
                      </label>
                      <span className="poe-choices-help">
                        💡 يمكنك كتابة زيادة السعر (بالجنيه) أمام أي خيار تود زيادة سعره، أو اتركه 0 إن لم تكن هناك زيادة
                      </span>
                    </div>

                    <div className="poe-choices-list">
                      {(group.choices || [{ name: "", price: 0 }]).map((rawChoice, cIdx) => {
                        const choice =
                          typeof rawChoice === "object" && rawChoice !== null
                            ? rawChoice
                            : { name: String(rawChoice || ""), price: 0 };

                        return (
                          <div className="poe-choice-row" key={cIdx}>
                            <span className="poe-choice-num">{cIdx + 1}.</span>

                            {/* Choice Name */}
                            <div className="poe-choice-name-wrapper">
                              <input
                                type="text"
                                className="poe-choice-name-input"
                                placeholder="اسم الخيار (مثال: حجم كبير، جبنة إضافية...)"
                                value={choice.name || ""}
                                onChange={(e) =>
                                  handleChoiceFieldChange(gIdx, cIdx, "name", e.target.value)
                                }
                              />
                            </div>

                            {/* Choice Extra Price */}
                            <div
                              className="poe-choice-price-wrapper"
                              title="زيادة السعر لهذا الخيار بالجنيه (اتركه 0 إذا لم يكن هناك زيادة)"
                            >
                              <span className="poe-choice-price-plus">+</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                className="poe-choice-price-input"
                                placeholder="0"
                                value={
                                  choice.price !== undefined && choice.price !== null
                                    ? choice.price
                                    : ""
                                }
                                onChange={(e) =>
                                  handleChoiceFieldChange(gIdx, cIdx, "price", e.target.value)
                                }
                              />
                              <span className="poe-choice-price-unit">جنيه</span>
                            </div>

                            {/* Remove Choice */}
                            <button
                              type="button"
                              className="poe-remove-choice-btn"
                              onClick={() => handleRemoveChoice(gIdx, cIdx)}
                              title="حذف هذا الخيار"
                              disabled={(group.choices || []).length <= 1}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="poe-add-choice-btn"
                      onClick={() => handleAddChoice(gIdx)}
                    >
                      ➕ إضافة خيار آخر لهذه المجموعة
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="poe-add-group-btn"
                onClick={() => handleAddGroup()}
              >
                ➕ إضافة مجموعة خيارات جديدة
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

package domain

import (
	"fmt"
	"strings"
)

// Rank represents a season-scoped competitive rank.
type Rank struct {
	Tier      int
	Name      string
	Icon      string
	MinPoints int
}

// JobClass represents a selectable RPG hunter job for a user profile.
type JobClass struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Icon        string `json:"icon"`
	Description string `json:"description"`
	Trait       string `json:"trait"`
}

// AllSeasonRanks defines Mobile-Legends-inspired rank titles for the current
// season only. Rank resets with seasonal points.
var AllSeasonRanks = []Rank{
	{Tier: 1, Name: "Warrior", Icon: "🛡️", MinPoints: 0},
	{Tier: 2, Name: "Elite", Icon: "⚔️", MinPoints: 150},
	{Tier: 3, Name: "Master", Icon: "🏹", MinPoints: 350},
	{Tier: 4, Name: "Grandmaster", Icon: "🔥", MinPoints: 650},
	{Tier: 5, Name: "Epic", Icon: "💎", MinPoints: 900},
	{Tier: 6, Name: "Legend", Icon: "👑", MinPoints: 1250},
	{Tier: 7, Name: "Mythic", Icon: "🌙", MinPoints: 1700},
	{Tier: 8, Name: "Mythical Honor", Icon: "🐉", MinPoints: 2350},
	{Tier: 9, Name: "Mythical Glory", Icon: "✨", MinPoints: 3200},
	{Tier: 10, Name: "Mythical Immortal", Icon: "🌟", MinPoints: 4500},
}

// AllJobClasses defines jobs inspired by Solo Leveling hunter roles and common
// RPG archetypes. Each job maps to a unique primary attribute (see
// JobClassPrimaryAttribute) so specializations are diverse - no two jobs share
// the same primary stat, except Mage which stays mixed across all attributes.
var AllJobClasses = []JobClass{
	{ID: "fighter", Name: "Fighter", Icon: "⚔️", Description: "Melee hunter yang mengandalkan kekuatan, disiplin, dan tenaga raw.", Trait: "cocok untuk yang suka latihan strength/functional — STR"},
	{ID: "tank", Name: "Tanker", Icon: "🛡️", Description: "Frontliner yang kuat bertahan dan konsisten menjaga formasi jarak jauh.", Trait: "cocok untuk yang fokus endurance, hiking, trekking, dan habit jangka panjang — END"},
	{ID: "assassin", Name: "Assassin", Icon: "🗡️", Description: "Hunter cepat, gesit, dan tajam mengeksekusi sesi singkat tapi intens.", Trait: "cocok untuk HIIT, sprint, olahraga raket, atau workout cepat — AGI"},
	{ID: "mage", Name: "Mage", Icon: "🔥", Description: "Damage dealer jarak jauh dengan energi eksplosif dan variasi latihan.", Trait: "cocok untuk yang suka eksplor banyak jenis olahraga — ALL attributes"},
	{ID: "ranger", Name: "Ranger", Icon: "🏹", Description: "Hunter presisi yang unggul di stamina, pace, dan jarak.", Trait: "cocok untuk lari, sepeda, jalan kaki, renang, kardio — STA"},
	{ID: "healer", Name: "Healer", Icon: "💚", Description: "Support hunter yang menjaga recovery, mobilitas, dan kesehatan jangka panjang.", Trait: "cocok untuk yoga, mobility, recovery, meditasi, pola hidup sehat — VIT"},
	{ID: "necromancer", Name: "Necromancer", Icon: "🌑", Description: "Hidden job yang bangkit dari kegagalan dan mengubah comeback jadi kekuatan.", Trait: "cocok untuk movement challenge, exploration, comeback workout, dan adaptability — LUK"},
}

// GetSeasonRank returns the current season rank for seasonal points.
func GetSeasonRank(seasonalPoints int) Rank {
	current := AllSeasonRanks[0]
	for _, r := range AllSeasonRanks {
		if seasonalPoints >= r.MinPoints {
			current = r
		}
	}
	return current
}

// FormatSeasonRank returns a display string like "C-Rank Hunter 🟦".
func FormatSeasonRank(seasonalPoints int) string {
	rank := GetSeasonRank(seasonalPoints)
	return fmt.Sprintf("%s %s", rank.Name, rank.Icon)
}

// GetJobClass returns a job class by id.
func GetJobClass(id string) (*JobClass, bool) {
	for _, job := range AllJobClasses {
		if job.ID == id {
			return &job, true
		}
	}
	return nil, false
}

// FormatJobClass returns the display string for a job id.
func FormatJobClass(id string) string {
	job, ok := GetJobClass(id)
	if !ok {
		return "Belum memilih job"
	}
	return fmt.Sprintf("%s %s", job.Name, job.Icon)
}

// JobClassPrimaryAttribute returns the attribute specialty used for daily
// side-quest rotation and report fallback. Each job has a unique primary
// attribute so specializations are diverse:
//
//	fighter     → STR (raw strength)
//	ranger      → STA (cardio/stamina)
//	assassin    → AGI (agility/speed)
//	tank        → END (endurance/sustained effort)
//	healer      → VIT (vitality/recovery)
//	necromancer → LUK (luck/resilience/comeback)
//	mage        → ""  (mixed — all attributes)
//
// Mage stays mixed by returning an empty attribute.
func JobClassPrimaryAttribute(jobClass string) AttributeType {
	switch strings.ToLower(strings.TrimSpace(jobClass)) {
	case "fighter":
		return AttrStr
	case "ranger":
		return AttrSta
	case "assassin":
		return AttrAgi
	case "tank":
		return AttrEnd
	case "healer":
		return AttrVit
	case "necromancer":
		return AttrLuk
	default:
		return ""
	}
}

// GetNextSeasonRank returns the next season rank and missing seasonal points, or nil at max rank.
func GetNextSeasonRank(seasonalPoints int) (*Rank, int) {
	for _, r := range AllSeasonRanks {
		if seasonalPoints < r.MinPoints {
			return &r, r.MinPoints - seasonalPoints
		}
	}
	return nil, 0
}

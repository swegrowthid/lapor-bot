package domain

import "testing"

func TestGetNextSeasonRank_UsesSeasonThresholds(t *testing.T) {
	next, remaining := GetNextSeasonRank(915)
	if next == nil {
		t.Fatal("expected next season rank")
	}
	if next.Name != "Legend" || remaining != 335 {
		t.Fatalf("next rank = %s, remaining = %d; want Legend, 335", next.Name, remaining)
	}
}

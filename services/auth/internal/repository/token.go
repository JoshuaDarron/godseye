package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RefreshToken represents a row in the refresh_tokens table.
type RefreshToken struct {
	ID        string
	UserID    string
	TokenHash string
	ExpiresAt time.Time
	CreatedAt time.Time
}

// TokenRepo provides CRUD operations on the refresh_tokens table.
type TokenRepo struct {
	pool *pgxpool.Pool
}

// NewTokenRepo creates a new TokenRepo.
func NewTokenRepo(pool *pgxpool.Pool) *TokenRepo {
	return &TokenRepo{pool: pool}
}

// StoreRefreshToken inserts a new refresh token record.
func (r *TokenRepo) StoreRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)
	`, userID, tokenHash, expiresAt)
	if err != nil {
		return fmt.Errorf("store refresh token: %w", err)
	}
	return nil
}

// GetRefreshToken looks up a refresh token by its hash and checks expiry.
func (r *TokenRepo) GetRefreshToken(ctx context.Context, tokenHash string) (*RefreshToken, error) {
	t := &RefreshToken{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, token_hash, expires_at, created_at
		FROM refresh_tokens
		WHERE token_hash = $1 AND expires_at > NOW()
	`, tokenHash).Scan(&t.ID, &t.UserID, &t.TokenHash, &t.ExpiresAt, &t.CreatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get refresh token: %w", err)
	}
	return t, nil
}

// DeleteRefreshToken removes a refresh token by its hash.
func (r *TokenRepo) DeleteRefreshToken(ctx context.Context, tokenHash string) error {
	_, err := r.pool.Exec(ctx, `
		DELETE FROM refresh_tokens WHERE token_hash = $1
	`, tokenHash)
	if err != nil {
		return fmt.Errorf("delete refresh token: %w", err)
	}
	return nil
}

// DeleteAllUserRefreshTokens removes all refresh tokens for a user.
func (r *TokenRepo) DeleteAllUserRefreshTokens(ctx context.Context, userID string) error {
	_, err := r.pool.Exec(ctx, `
		DELETE FROM refresh_tokens WHERE user_id = $1
	`, userID)
	if err != nil {
		return fmt.Errorf("delete all user refresh tokens: %w", err)
	}
	return nil
}

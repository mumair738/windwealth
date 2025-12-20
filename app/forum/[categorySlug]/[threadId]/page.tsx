'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { AccountBanner } from '@/components/forum/AccountBanner';
import styles from './page.module.css';

type MeResponse = { user: { id: string; username: string; avatarUrl: string | null } | null };

type ThreadResponse = {
  thread: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    category: { slug: string; name: string };
    author: { username: string; avatarUrl: string | null };
  };
  posts: Array<{
    id: string;
    body: string;
    attachmentUrl: string | null;
    attachmentMime: string | null;
    createdAt: string;
    author: { username: string; avatarUrl: string | null };
  }>;
};

async function uploadIfPresent(file: File | null) {
  if (!file) return null;
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Upload failed');
  }
  return (await res.json()) as { url: string; mime: string };
}

export default function ForumThreadPage({
  params,
}: {
  params: { categorySlug: string; threadId: string };
}) {
  const { categorySlug, threadId } = params;

  const [me, setMe] = useState<MeResponse['user']>(null);
  const [data, setData] = useState<ThreadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyBody, setReplyBody] = useState('');
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [meRes, threadRes] = await Promise.all([
        fetch('/api/me', { cache: 'no-store' }),
        fetch(`/api/forum/threads/${encodeURIComponent(threadId)}`, { cache: 'no-store' }),
      ]);

      const meData = (await meRes.json()) as MeResponse;
      const threadData = (await threadRes.json()) as ThreadResponse;

      setMe(meData.user);
      if ((threadData as any)?.error) throw new Error((threadData as any).error);
      setData(threadData);
    } catch (e: any) {
      setError(e?.message || 'Failed to load thread');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  async function handleReply() {
    setError(null);
    try {
      const uploaded = await uploadIfPresent(replyAttachment);

      const res = await fetch(`/api/forum/threads/${encodeURIComponent(threadId)}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: replyBody,
          attachmentUrl: uploaded?.url ?? null,
          attachmentMime: uploaded?.mime ?? null,
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.error || 'Failed to post reply');

      setReplyBody('');
      setReplyAttachment(null);
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to post reply');
    }
  }

  const thread = data?.thread;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{thread?.title || 'Thread'}</h1>
            {thread && (
              <div className={styles.meta}>
                In{' '}
                <Link href={`/forum/${thread.category.slug}`}>{thread.category.name}</Link> • started by{' '}
                {thread.author.username}
              </div>
            )}
          </div>
          <Link className={`${styles.button} ${styles.buttonSecondary}`} href={`/forum/${categorySlug}`}>
            Back to Category
          </Link>
        </div>

        <div className={styles.bannerWrapper}>
          <AccountBanner />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.chatboxArea}>
          {loading && (
            <div className={styles.chatboxLoading}>
              <div>Loading thread…</div>
            </div>
          )}

          {!loading && data && (
            <>
              <div className={styles.chatboxHeader}>
                <div>
                  <h2 className={styles.chatboxTitle}>{data.thread.title}</h2>
                  <div className={styles.chatboxMeta}>
                    Started by {data.thread.author.username} •{' '}
                    {new Date(data.thread.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className={styles.messagesContainer}>
                {data.posts.map((p) => (
                  <div key={p.id} className={styles.message}>
                    <div className={styles.messageHeader}>
                      <div className={styles.messageAuthor}>
                        {p.author.avatarUrl ? (
                          <img
                            src={p.author.avatarUrl}
                            alt={p.author.username}
                            className={styles.messageAvatar}
                          />
                        ) : (
                          <div className={styles.messageAvatarPlaceholder} />
                        )}
                        <span className={styles.messageUsername}>{p.author.username}</span>
                      </div>
                      <div className={styles.messageTime}>
                        {new Date(p.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={styles.messageBody}>{p.body}</div>
                    {p.attachmentUrl && (
                      <div className={styles.messageAttachment}>
                        <Image
                          src={p.attachmentUrl}
                          alt="Attachment"
                          width={600}
                          height={400}
                          className={styles.messageImage}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {me ? (
                <div className={styles.replyBox}>
                  <div className={styles.replyHeader}>Reply as {me.username}</div>
                  <textarea
                    className={styles.replyTextarea}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write a reply…"
                  />
                  <input
                    className={styles.replyInput}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={(e) => setReplyAttachment(e.target.files?.[0] || null)}
                  />
                  <div className={styles.replyActions}>
                    <button className={styles.replyButton} type="button" onClick={handleReply}>
                      Post reply
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.replyBox}>
                  <div className={styles.replyGuest}>Create an account to reply.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

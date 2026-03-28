import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { Ionicons } from "@expo/vector-icons";
import {
  Comment,
  getComments,
  addComment,
  editComment,
  deleteComment,
  getCommentReactions,
  setCommentReaction,
  removeCommentReaction,
} from "@/entities/services/comment";
import { ReactionsCount } from "@/entities/article/model";
import axiosClient from "@/entities/api/api";
import { useRouter } from "expo-router";

interface CommentsSectionProps {
  articleId: number;
  currentUserId?: number;
}

export const CommentsSection = ({
  articleId,
  currentUserId,
}: CommentsSectionProps) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const LIKE_TYPE_ID = 1;
  const PAGE_SIZE = 10;
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const isLoadingMoreRef = useRef(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reply / edit state
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  // Comment reactions state
  const [commentReactions, setCommentReactions] = useState<
    Record<number, ReactionsCount>
  >({});

  const parseResponse = (result: any): { items: Comment[]; total?: number } => {
    if (Array.isArray(result)) return { items: result };
    if (result && typeof result === "object" && "data" in result) {
      return { items: result.data, total: result.total };
    }
    return { items: result as Comment[] };
  };

  const fetchPage = useCallback(async (page: number, append: boolean) => {
    const result = await getComments(articleId, page, PAGE_SIZE);
    const { items, total } = parseResponse(result);

    if (append) {
      setComments((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newItems = items.filter((c) => !existingIds.has(c.id));
        return [...prev, ...newItems];
      });
    } else {
      setComments(items);
    }

    const more = total !== undefined
      ? page * PAGE_SIZE < total
      : items.length >= PAGE_SIZE;
    hasMoreRef.current = more;
    setHasMore(more);
    pageRef.current = page;
  }, [articleId]);

  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setLoading(true);
    fetchPage(1, false).finally(() => setLoading(false));
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      await fetchPage(pageRef.current + 1, true);
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      if (editingComment) {
        await editComment(editingComment.id, trimmed);
        setEditingComment(null);
      } else {
        await addComment(articleId, trimmed, replyTo?.id);
        setReplyTo(null);
      }
      setText("");
      pageRef.current = 1;
      hasMoreRef.current = true;
      await fetchPage(1, false);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (comment: Comment) => {
    Alert.alert(
      t("thread.comments.deleteConfirm"),
      t("thread.comments.deleteConfirmMessage"),
      [
        { text: t("thread.comments.cancel"), style: "cancel" },
        {
          text: t("thread.comments.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteComment(comment.id);
            pageRef.current = 1;
            hasMoreRef.current = true;
            await fetchPage(1, false);
          },
        },
      ],
    );
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setReplyTo(null);
    setText(comment.message);
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    setEditingComment(null);
    setText("");
  };

  const cancelAction = () => {
    setReplyTo(null);
    setEditingComment(null);
    setText("");
  };

  const collectCommentIds = (items: Comment[]): number[] => {
    const ids: number[] = [];
    const walk = (list: Comment[]) => {
      for (const c of list) {
        ids.push(c.id);
        if (c.children?.length) walk(c.children);
      }
    };
    walk(items);
    return ids;
  };

  const fetchReactionsForComments = useCallback(async (items: Comment[]) => {
    const ids = collectCommentIds(items);
    const results: Record<number, ReactionsCount> = {};
    await Promise.all(
      ids.map(async (id) => {
        try {
          results[id] = await getCommentReactions(id);
        } catch {
          // ignore
        }
      }),
    );
    setCommentReactions((prev) => ({ ...prev, ...results }));
  }, []);

  useEffect(() => {
    if (comments.length > 0) {
      fetchReactionsForComments(comments);
    }
  }, [comments, fetchReactionsForComments]);

  const handleCommentReaction = async (
    commentId: number,
    type: "like" | "dislike",
  ) => {
    const current = commentReactions[commentId];
    try {
      let result: ReactionsCount;
      if (current?.userReaction === type) {
        result = await removeCommentReaction(commentId);
      } else {
        result = await setCommentReaction(commentId, LIKE_TYPE_ID);
      }
      setCommentReactions((prev) => ({ ...prev, [commentId]: result }));
    } catch {
      // ignore
    }
  };

  const navigateToProfile = (userId: number) => {
    router.push({
      pathname: "/profile/[id]",
      params: { id: userId.toString() },
    });
  };

  const getAuthorName = (comment: Comment) => {
    if (!comment.author) return "?";
    const { firstName, lastName, login } = comment.author;
    return [firstName, lastName].filter(Boolean).join(" ") || `@${login}`;
  };

  const getInitial = (comment: Comment) => {
    if (!comment.author) return "?";
    return (
      comment.author.firstName?.[0] ||
      comment.author.login?.[0] ||
      "?"
    ).toUpperCase();
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const locale = i18n.language === "ru-RU" ? "ru-RU" : "en-US";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);

    if (diffMin < 1) return locale === "ru-RU" ? "только что" : "just now";
    if (diffMin < 60) return `${diffMin}${locale === "ru-RU" ? " мин" : "m"}`;
    if (diffHr < 24) return `${diffHr}${locale === "ru-RU" ? " ч" : "h"}`;

    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
    });
  };

  const renderComment = (comment: Comment, depth: number) => {
    const avatarUri = comment.author?.avatar
      ? axiosClient.getFileUrl(comment.author.avatar)
      : undefined;
    const isOwn = currentUserId === comment.userId;

    return (
      <View
        key={comment.id}
        style={[
          styles.commentItem,
          depth > 0 && styles.nested,
          depth > 0 && { borderLeftColor: colors.borderColor },
        ]}
      >
        <View style={styles.commentHeader}>
          <TouchableOpacity
            style={styles.authorTouchable}
            onPress={() => comment.author && navigateToProfile(comment.author.id)}
            activeOpacity={0.7}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.bcSubBlockColor },
                ]}
              >
                <Text
                  style={[styles.avatarInitial, { color: colors.textColor }]}
                >
                  {getInitial(comment)}
                </Text>
              </View>
            )}
            <Text style={[styles.authorName, { color: colors.linkColor }]}>
              {getAuthorName(comment)}
            </Text>
          </TouchableOpacity>
          {comment.createdAt && (
            <Text style={[styles.commentTime, { color: colors.activeTextColor }]}>
              {formatTime(comment.createdAt)}
            </Text>
          )}
        </View>

        <Text style={[styles.commentText, { color: colors.textColor }]}>
          {comment.message}
        </Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => handleCommentReaction(comment.id, "like")}
          >
            <Ionicons
              name={
                commentReactions[comment.id]?.userReaction === "like"
                  ? "heart"
                  : "heart-outline"
              }
              size={16}
              color={
                commentReactions[comment.id]?.userReaction === "like"
                  ? "#e74c3c"
                  : colors.activeTextColor
              }
            />
            {(commentReactions[comment.id]?.likes ?? 0) > 0 && (
              <Text style={[styles.heartCount, { color: colors.textColor }]}>
                {commentReactions[comment.id]?.likes}
              </Text>
            )}
          </TouchableOpacity>
          {depth < 3 && (
            <TouchableOpacity onPress={() => handleReply(comment)}>
              <Text style={[styles.actionText, { color: colors.linkColor }]}>
                {t("thread.comments.reply")}
              </Text>
            </TouchableOpacity>
          )}
          {isOwn && (
            <>
              <TouchableOpacity onPress={() => handleEdit(comment)}>
                <Text
                  style={[styles.actionText, { color: colors.linkColor }]}
                >
                  {t("thread.comments.edit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(comment)}>
                <Text
                  style={[styles.actionText, { color: colors.deleteColor }]}
                >
                  {t("thread.comments.delete")}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {comment.children &&
          comment.children.length > 0 &&
          comment.children.map((child) => renderComment(child, depth + 1))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textColor }]}>
        {t("thread.comments.title")}
      </Text>

      {/* Input bar */}
      {(replyTo || editingComment) && (
        <View
          style={[
            styles.contextBar,
            { backgroundColor: colors.bcSubBlockColor },
          ]}
        >
          <Text style={[styles.contextText, { color: colors.textColor }]} numberOfLines={1}>
            {editingComment
              ? t("thread.comments.editing")
              : `${t("thread.comments.replyingTo")} ${getAuthorName(replyTo!)}`}
          </Text>
          <TouchableOpacity onPress={cancelAction}>
            <Ionicons name="close" size={18} color={colors.textColor} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.bcSubBlockColor,
              color: colors.textColor,
            },
          ]}
          placeholder={t("thread.comments.placeholder")}
          placeholderTextColor={colors.placeholderColor}
          value={text}
          onChangeText={setText}
          maxLength={512}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: text.trim() ? colors.linkColor : colors.bcSubBlockColor },
          ]}
          onPress={handleSubmit}
          disabled={!text.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name="send"
              size={18}
              color={text.trim() ? "#fff" : colors.placeholderColor}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Comments list */}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.linkColor}
          style={{ paddingVertical: 20 }}
        />
      ) : comments.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.placeholderColor }]}>
          {t("thread.comments.empty")}
        </Text>
      ) : (
        <>
          {comments.map((c) => renderComment(c, 0))}
          {hasMore && (
            <TouchableOpacity
              style={[styles.loadMoreButton, { backgroundColor: colors.bcSubBlockColor }]}
              onPress={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={colors.linkColor} />
              ) : (
                <Text style={[styles.loadMoreText, { color: colors.linkColor }]}>
                  {t("thread.comments.loadMore")}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  contextBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  contextText: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    flex: 1,
    marginRight: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    textAlign: "center",
    paddingVertical: 16,
  },

  loadMoreButton: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  loadMoreText: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },

  // Comment item
  commentItem: {
    gap: 4,
  },
  nested: {
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  authorName: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
  },
  commentTime: {
    fontSize: 11,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  commentText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 20,
    marginLeft: 36,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
    marginLeft: 36,
    marginTop: 2,
  },
  actionText: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  authorTouchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heartButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  heartCount: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
});

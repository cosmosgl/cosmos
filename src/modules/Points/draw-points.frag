// Fragment shader for rendering points with various shapes and smooth edges

#ifdef GL_ES
precision highp float;
#endif

// The color and alpha values from the vertex shader
varying vec3 rgbColor;
varying float alpha;
varying float pointShape;

// Smoothing controls the smoothness of the point's edge
const float smoothing = 0.9;

// Shape constants
const float CIRCLE = 0.0;
const float RECTANGLE = 1.0;
const float TRIANGLE = 2.0;
const float DIAMOND = 3.0;
const float PENTAGON = 4.0;
const float HEXAGON = 5.0;
const float STAR = 6.0;
const float CROSS = 7.0;

// Distance functions for different shapes
float circleDistance(vec2 p) {
    return dot(p, p);
}

float rectangleDistance(vec2 p) {
    vec2 d = abs(p) - vec2(0.8);
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float triangleDistance(vec2 p) {
    const float k = sqrt(3.0);   // ≈1.732; slope of 60° lines for an equilateral triangle
    p.x = abs(p.x) - 0.9;        // fold the X axis and shift: brings left and right halves together
    p.y = p.y + 0.55;             // move the whole shape up slightly so it is centred vertically

    // reflect points that fall outside the main triangle back inside, to reuse the same maths
    if (p.x + k * p.y > 0.0)
        p = vec2(p.x - k * p.y,  -k * p.x - p.y) / 2.0;

    p.x -= clamp(p.x, -1.0, 0.0); // clip any remainder on the left side

    // Return signed distance: negative = inside; positive = outside
    return -length(p) * sign(p.y);
}

float diamondDistance(vec2 p) {
    // aspect > 1  →  taller diamond
    const float aspect = 1.2;
    return abs(p.x) + abs(p.y) / aspect - 0.8;
}

float pentagonDistance(vec2 p) {
    // Regular pentagon signed-distance (Inigo Quilez)
    const vec3 k = vec3(0.809016994, 0.587785252, 0.726542528);
    p.x = abs(p.x);

    // Reflect across the two tilted edges ─ only if point is outside
    p -= 2.0 * min(dot(vec2(-k.x, k.y), p), 0.0) * vec2(-k.x, k.y);
    p -= 2.0 * min(dot(vec2( k.x, k.y), p), 0.0) * vec2( k.x, k.y);

    // Clip against the top horizontal edge (keeps top point sharp)
    p -= vec2(clamp(p.x, -k.z * k.x, k.z * k.x), k.z);

    // Return signed distance (negative → inside, positive → outside)
    return length(p) * sign(p.y);
}

float hexagonDistance(vec2 p) {
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= vec2(clamp(p.x, -k.z * 0.8, k.z * 0.8), 0.8);
    return length(p) * sign(p.y);
}

float starDistance(vec2 p) {
    // 5-point star signed-distance function (adapted from Inigo Quilez)
    // r  – outer radius, rf – inner/outer radius ratio
    const float r  = 0.9;
    const float rf = 0.45;

    // Pre-computed rotation vectors for the star arms (36° increments)
    const vec2 k1 = vec2(0.809016994, -0.587785252);
    const vec2 k2 = vec2(-k1.x, k1.y);

    // Fold the plane into a single arm sector
    p.x = abs(p.x);
    p -= 2.0 * max(dot(k1, p), 0.0) * k1;
    p -= 2.0 * max(dot(k2, p), 0.0) * k2;
    p.x = abs(p.x);

    // Translate so the top tip of the star lies on the X-axis
    p.y -= r;

    // Vector describing the edge between an outer tip and its adjacent inner point
    vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
    // Project the point onto that edge and clamp the projection to the segment
    float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);

    // Return signed distance (negative => inside, positive => outside)
    return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}

float crossDistance(vec2 p) {
    // Signed distance function for a cross (union of two rectangles)
    // Adapted from Inigo Quilez (https://iquilezles.org/)
    // Each arm has half-sizes 0.3 (thickness) and 0.8 (length)
    p = abs(p);
    if (p.y > p.x) p = p.yx;       // exploit symmetry

    vec2 q = p - vec2(0.8, 0.3);   // subtract half-sizes (length, thickness)

    // Standard rectangle SDF, then take union of the two arms
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float getShapeDistance(vec2 p, float shape) {
    if (shape == RECTANGLE) return rectangleDistance(p);
    else if (shape == TRIANGLE) return triangleDistance(p);
    else if (shape == DIAMOND) return diamondDistance(p);
    else if (shape == PENTAGON) return pentagonDistance(p);
    else if (shape == HEXAGON) return hexagonDistance(p);
    else if (shape == STAR) return starDistance(p);
    else if (shape == CROSS) return crossDistance(p);
    else return circleDistance(p); // Default to circle
}

void main() {
    // Discard the fragment if the point is fully transparent
    if (alpha == 0.0) { discard; }

    // Calculate coordinates within the point
    vec2 pointCoord = 2.0 * gl_PointCoord - 1.0;
    
    float opacity;
    if (pointShape == CIRCLE) {
        // For circles, use the original distance calculation
        float pointCenterDistance = dot(pointCoord, pointCoord);
        opacity = alpha * (1.0 - smoothstep(smoothing, 1.0, pointCenterDistance));
    } else {
        // For other shapes, use the shape distance function
        float shapeDistance = getShapeDistance(pointCoord, pointShape);
        opacity = alpha * (1.0 - smoothstep(-0.01, 0.01, shapeDistance));
    }

    gl_FragColor = vec4(rgbColor, opacity);
}
